import { DeathCertificate } from "@shared/schema";

interface DeathCertificateTemplateProps {
    data: DeathCertificate;
    id?: string;
}

export function DeathCertificateTemplate({ data, id }: DeathCertificateTemplateProps) {
    return (
        <div
            id={id}
            className="bg-white p-8 w-[794px] h-[1123px] border-[2px] border-black relative font-serif text-gray-900 overflow-hidden"
            style={{ boxSizing: 'border-box', position: 'relative' }}
        >
            {/* Background Watermark - Ripon Building */}
            <div className="absolute inset-0 opacity-[0.08] flex items-center justify-center pointer-events-none z-0">
                <img
                    src="/uploads/ripon_building.png"
                    alt="Ripon Building Watermark"
                    className="w-[600px] grayscale"
                />
            </div>

            {/* Header Section */}
            <div className="relative z-10 text-center mb-4">
                <div className="flex justify-between items-start mb-2 pt-2 px-4">
                    <img src="/uploads/chennai_logo_left.png" alt="TN Logo" className="h-14 w-auto" />
                    <img src="/uploads/ashoka_pillar.png" alt="Gov of India Logo" className="h-16 w-auto" />
                    <div className="flex flex-col items-end">
                        <img src="/uploads/chennai_logo_right.png" alt="Chennai Logo" className="h-14 w-auto mb-1" />
                        <span className="text-[10px] font-bold">D4687682976/2014</span>
                    </div>
                </div>

                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold">சென்னை மாநகராட்சி</h1>
                    <h2 className="text-lg font-bold">CORPORATION OF CHENNAI</h2>
                    <h3 className="text-lg font-bold">பொது சுகாதாரத்துறை</h3>
                    <h4 className="text-base font-bold">DEPARTMENT OF PUBLIC HEALTH</h4>

                    <div className="mt-2">
                        <p className="font-bold text-xs">FORM-NO. 6, படிவம் எண். 6</p>
                        <p className="text-[10px] uppercase">(See rule 8-விதி 8 ஐப் பார்க்க)</p>
                    </div>

                    <div className="mt-2 inline-block border border-black px-6 py-1">
                        <h2 className="text-lg font-bold">DEATH CERTIFICATE / இறப்பு சான்றிதழ்</h2>
                    </div>

                    <div className="mt-1 text-[9px] font-bold">
                        <p>(ISSUED UNDER SECTION 12/17 OF REGISTRATION OF BIRTHAND DEATH ACT 1969)</p>
                        <p>பிறப்பு மற்றும் இறப்பு பதிவு சட்டம் 1969-ன் பிரிவு 12/17-ன் கீழ் வழங்கப்பட்டது</p>
                    </div>
                </div>
            </div>

            {/* Intro Text */}
            <div className="relative z-10 text-[11px] mb-6 leading-tight px-4 text-justify">
                <p>This is to certify that the following information has been taken from the original record of death of the Corporation of Chennai of the State of Tamil Nadu, India.</p>
                <p className="mt-1 font-bold">கீழ்கண்ட தகவல்கள் தமிழ்நாடு சென்னை மாநகராட்சி அசல் இறப்பு பதிவேட்டிலிருந்து எடுக்கப்பட்டன என சான்று வழங்கப்படுகிறது</p>
            </div>

            {/* Details Grid */}
            <div className="relative z-10 px-8 space-y-3 text-[12px]">
                <div className="grid grid-cols-12">
                    <div className="col-span-1">Zone</div>
                    <div className="col-span-1 font-bold">{data.zone}</div>
                    <div className="col-span-4"></div>
                    <div className="col-span-1">Division</div>
                    <div className="col-span-5 font-bold">{data.division}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-8 font-bold uppercase">{data.name}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Name of Father / Husband</div>
                    <div className="col-span-8 uppercase">{data.fatherHusbandName}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Name of Mother</div>
                    <div className="col-span-8 uppercase">{data.motherName}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Permanent Residential Address</div>
                    <div className="col-span-8 uppercase leading-tight whitespace-pre-wrap">{data.permanentAddress}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Address of the deceased at the time of death</div>
                    <div className="col-span-8 uppercase leading-tight whitespace-pre-wrap">{data.addressAtDeath}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Sex</div>
                    <div className="col-span-8 uppercase">{data.gender}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Age</div>
                    <div className="col-span-8 uppercase">{data.age}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Date of Death</div>
                    <div className="col-span-8 font-bold uppercase">{data.dateOfDeath}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Place of Death</div>
                    <div className="col-span-8 uppercase leading-tight">{data.placeOfDeath}</div>
                </div>

                <div className="grid grid-cols-12 pt-2 border-t border-gray-100">
                    <div className="col-span-4">Registration Number</div>
                    <div className="col-span-8 font-bold uppercase">{data.registrationNumber}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Date of Registration</div>
                    <div className="col-span-8 uppercase">{data.dateOfRegistration}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Date of Issue</div>
                    <div className="col-span-8 uppercase">{data.dateOfIssue}</div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">Remarks (If Any)</div>
                    <div className="col-span-8 uppercase">{data.remarks || 'HDR NO.174/2014'}</div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="relative z-10 mt-12 flex justify-between items-start px-8">
                <div className="flex flex-col items-center">
                    <img src="/uploads/health_seal.png" alt="Public Health Seal" className="h-28 w-auto mix-blend-multiply" />
                    <span className="text-[10px] font-bold mt-1 uppercase">{data.dateOfIssue}</span>
                </div>

                <div className="text-right flex flex-col items-end mt-4">
                    <div className="text-[#0D6B4F] font-bold text-base italic leading-tight mb-0.5">
                        Dr. P. KUGANANTHAM
                    </div>
                    <div className="text-[9px] font-bold leading-tight uppercase text-right">
                        M.B.B.S., D.P.H., M.P.H. - WHO Fellow (Johns Hopkins, USA)<br />
                        DTM&H (LSTM & H-UK), F.I.S.C.D.<br />
                        City Health Officer<br />
                        Corporation Of Chennai
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-6 text-center text-[10px] font-bold px-4">
                Ensure Registration of every Birth and Death / பிறப்பு / இறப்பு பதிவினை உறுதி செய்வீர்
            </div>

            {/* Bottom Disclaimer */}
            <div className="absolute bottom-10 left-8 right-8 z-10 pt-2 border-t border-black text-[9px] leading-tight">
                <p className="font-bold">Note : This certificate is computer generated and does not require any Seal/Signature in original.</p>
                <p>The authenticity of this certificate can be verified at www.chennaicorporation.gov.in. The Registration Number is unique to each death.</p>
            </div>
        </div>
    );
}
