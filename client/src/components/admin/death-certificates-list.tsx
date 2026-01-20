import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { DeathCertificate } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, FileText, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DeathCertificateTemplate } from "./death-certificate-template";
import { useToast } from "@/hooks/use-toast";

export function DeathCertificatesList() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCert, setSelectedCert] = useState<DeathCertificate | null>(null);
    const templateRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const { data: certificates, isLoading } = useQuery<DeathCertificate[]>({
        queryKey: ["/api/death-certificates"],
    });

    const filteredCertificates = certificates?.filter((cert) =>
        cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.aadharNumber.includes(searchTerm) ||
        cert.registrationNumber.includes(searchTerm)
    );

    const handleDownload = async (cert: DeathCertificate) => {
        setSelectedCert(cert);
        setIsGenerating(true);

        // Small delay to ensure template renders
        setTimeout(async () => {
            if (!templateRef.current) {
                setIsGenerating(false);
                return;
            }

            try {
                const element = templateRef.current;
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                    windowWidth: 794,
                    windowHeight: 1123,
                    width: 794,
                    height: 1123,
                    x: 0,
                    y: 0,
                    scrollX: 0,
                    scrollY: 0,
                });
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save(`death-certificate-${cert.registrationNumber.replace(/\//g, '-')}.pdf`);

                toast({
                    title: "Downloaded",
                    description: "Certificate has been re-downloaded.",
                });
            } catch (error) {
                console.error("PDF generation error:", error);
                toast({
                    title: "Error",
                    description: "Failed to generate PDF.",
                    variant: "destructive"
                });
            } finally {
                setIsGenerating(false);
                setSelectedCert(null);
            }
        }, 500);
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Generated Death Certificates
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by name, Aadhar or Registration number..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                        <p className="mt-2 text-gray-600">Loading certificates...</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Registration No.</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Aadhar No.</TableHead>
                                    <TableHead>Date of Death</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCertificates?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            No certificates found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCertificates?.map((cert) => (
                                        <TableRow key={cert.id}>
                                            <TableCell className="font-medium">{cert.registrationNumber}</TableCell>
                                            <TableCell>{cert.name}</TableCell>
                                            <TableCell>{cert.aadharNumber}</TableCell>
                                            <TableCell>{cert.dateOfDeath}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(cert)}
                                                    disabled={isGenerating && selectedCert?.id === cert.id}
                                                >
                                                    {isGenerating && selectedCert?.id === cert.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Download
                                                        </>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Hidden Template for PDF Capture */}
                {selectedCert && (
                    <div className="absolute opacity-0 pointer-events-none" style={{ left: '-9999px', top: '0' }}>
                        <div ref={templateRef} style={{ width: '794px', height: '1123px' }}>
                            <DeathCertificateTemplate data={selectedCert} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
