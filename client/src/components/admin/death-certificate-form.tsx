import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { FileWarning, Upload, Loader2, Download, CheckCircle2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DeathCertificateTemplate } from "./death-certificate-template";
import { DeathCertificate } from "@shared/schema";

// Form schema
const formSchema = z.object({
    aadharNumber: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, "Aadhar number must be in XXXX-XXXX-XXXX format"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    name: z.string().min(2, "Name is required"),
    fatherHusbandName: z.string().min(2, "Father/Husband name is required"),
    motherName: z.string().min(2, "Mother name is required"),
    gender: z.string().min(1, "Gender is required"),
    age: z.string().min(1, "Age is required"),
    dateOfDeath: z.string().min(1, "Date of death is required"),
    placeOfDeath: z.string().min(2, "Place of death is required"),
    permanentAddress: z.string().min(5, "Permanent address is required"),
    addressAtDeath: z.string().min(5, "Address at death is required"),
    zone: z.string().min(1, "Zone is required"),
    division: z.string().min(1, "Division is required"),
    remarks: z.string().optional(),
});

export function DeathCertificateForm() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [medicalCertFile, setMedicalCertFile] = useState<File | null>(null);
    const [aadharProofFile, setAadharProofFile] = useState<File | null>(null);
    const [generatedCert, setGeneratedCert] = useState<DeathCertificate | null>(null);
    const templateRef = useRef<HTMLDivElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            aadharNumber: "",
            dateOfBirth: "",
            name: "",
            fatherHusbandName: "",
            motherName: "",
            gender: "male",
            age: "",
            dateOfDeath: "",
            placeOfDeath: "",
            permanentAddress: "",
            addressAtDeath: "",
            zone: "09",
            division: "111",
            remarks: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!medicalCertFile || !aadharProofFile) {
            toast({
                title: "Missing Documents",
                description: "Please upload both Medical Certificate and Aadhar Proof.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value as string);
            });
            formData.append("medicalCertificate", medicalCertFile);
            formData.append("aadharProof", aadharProofFile);

            const response = await fetch("/api/death-certificate", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to generate death certificate");
            }

            setGeneratedCert(data.certificate);

            toast({
                title: "Success",
                description: data.message,
                className: "bg-green-50 border-green-200"
            });

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadPDF = async () => {
        if (!templateRef.current) return;

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
            pdf.save(`death-certificate-${generatedCert?.registrationNumber.replace(/\//g, '-')}.pdf`);

            toast({
                title: "Downloaded",
                description: "Death certificate has been downloaded successfully.",
            });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast({
                title: "Error",
                description: "Failed to generate PDF. Please try again.",
                variant: "destructive"
            });
        }
    };

    const resetForm = () => {
        form.reset();
        setMedicalCertFile(null);
        setAadharProofFile(null);
        setGeneratedCert(null);
    };

    if (generatedCert) {
        return (
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-100">
                    <CardTitle className="text-green-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Certificate Generated Successfully
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-12 flex flex-col items-center">
                    <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center max-w-md">
                        <h3 className="text-xl font-bold text-green-900 mb-2">Ready for Download</h3>
                        <p className="text-green-700">
                            The death certificate for <strong>{generatedCert.name}</strong> has been generated with registration number
                            <strong>{generatedCert.registrationNumber}</strong>.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={downloadPDF} size="lg" className="bg-blue-600 hover:bg-blue-700">
                            <Download className="w-5 h-5 mr-2" />
                            Download Official Certificate (PDF)
                        </Button>
                        <Button variant="outline" onClick={resetForm} size="lg">
                            Generate Another
                        </Button>
                    </div>

                    {/* Hidden Template for PDF Capture */}
                    <div className="absolute opacity-0 pointer-events-none" style={{ left: '-9999px', top: '0' }}>
                        <div ref={templateRef} style={{ width: '794px', height: '1123px' }}>
                            <DeathCertificateTemplate data={generatedCert} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
                <CardTitle className="text-red-800 flex items-center gap-2">
                    <FileWarning className="w-5 h-5" />
                    Generate Death Certificate
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h3 className="text-yellow-800 font-semibold flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin hidden" />
                        Important Warning
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                        Generating a death certificate will <strong>permanently delete</strong> the citizen record from the database.
                        This action cannot be undone. Please verify all details carefully before proceeding.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="aadharNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Aadhar Number of Deceased</FormLabel>
                                        <FormControl>
                                            <Input placeholder="XXXX-XXXX-XXXX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Name as per Aadhar" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fatherHusbandName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Father / Husband Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Name of father or husband" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="motherName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mother's Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Name of mother" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age at Death</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 57 YEARS" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dateOfDeath"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Death</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="placeOfDeath"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Place of Death</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Hospital name or Address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="zone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 09" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="division"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Division</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 111" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="permanentAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Permanent Residential Address</FormLabel>
                                        <FormControl>
                                            <textarea
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="addressAtDeath"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address at time of death</FormLabel>
                                        <FormControl>
                                            <textarea
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks (If any)</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g. HDR NO.174/2014" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="medical-cert">Medical Certificate</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                    <Input
                                        id="medical-cert"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setMedicalCertFile(e.target.files?.[0] || null)}
                                    />
                                    <Label htmlFor="medical-cert" className="cursor-pointer">
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <span className="text-sm text-gray-600 block">
                                            {medicalCertFile ? medicalCertFile.name : "Upload Medical Certificate"}
                                        </span>
                                        <span className="text-xs text-gray-400 block mt-1">PDF or Image (Max 5MB)</span>
                                    </Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="aadhar-proof">Aadhar Card Proof</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                    <Input
                                        id="aadhar-proof"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setAadharProofFile(e.target.files?.[0] || null)}
                                    />
                                    <Label htmlFor="aadhar-proof" className="cursor-pointer">
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <span className="text-sm text-gray-600 block">
                                            {aadharProofFile ? aadharProofFile.name : "Upload Aadhar Proof"}
                                        </span>
                                        <span className="text-xs text-gray-400 block mt-1">PDF or Image (Max 5MB)</span>
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                variant="destructive"
                                size="lg"
                                disabled={isSubmitting}
                                className="w-full md:w-auto"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FileWarning className="w-4 h-4 mr-2" />
                                        Generate Certificate & Delete Record
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
