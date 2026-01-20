import { Citizen, VoterRegistration } from "@shared/schema";

interface VoterAcknowledgementTemplateProps {
    data: {
        citizen: Citizen;
        registration: VoterRegistration;
    };
    id?: string;
}

export function VoterAcknowledgementTemplate({ data, id }: VoterAcknowledgementTemplateProps) {
    const { citizen, registration } = data;

    return (
        <div
            id={id}
            className="bg-white p-12 w-[794px] h-[1123px] border-[12px] border-double border-green-800 relative font-serif text-gray-900 overflow-hidden"
            style={{ boxSizing: 'border-box' }}
        >
            {/* Background Watermark */}
            <div className="absolute inset-0 opacity-[0.05] flex items-center justify-center pointer-events-none z-0">
                <img
                    src="/uploads/ashoka_pillar.png"
                    alt="Ashoka Pillar Watermark"
                    className="w-[500px] grayscale"
                />
            </div>

            {/* Header Section */}
            <div className="relative z-10 text-center mb-10 border-b-2 border-green-800 pb-6">
                <div className="flex justify-center mb-4">
                    <img src="/uploads/ashoka_pillar.png" alt="Gov of India Logo" className="h-24 w-auto" />
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-widest uppercase">Government of India</h1>
                    <h2 className="text-xl font-bold tracking-wider">ELECTION COMMISSION OF INDIA</h2>
                    <h3 className="text-lg font-semibold text-green-800">VOTER REGISTRATION ACKNOWLEDGEMENT</h3>
                    <p className="text-sm font-bold mt-2">FORM-NO. 6A</p>
                </div>
            </div>

            {/* Certificate Body */}
            <div className="relative z-10 px-6">
                <div className="text-center mb-8">
                    <p className="text-base leading-relaxed">
                        This is to acknowledge that the following citizen has been successfully registered in the
                        national electoral database after biometric and identity verification.
                    </p>
                </div>

                {/* Details Grid */}
                <div className="space-y-6 text-sm">
                    <div className="grid grid-cols-12 border-b-2 border-green-800 pb-2 bg-green-50 p-2 rounded">
                        <div className="col-span-4 font-bold text-green-900 uppercase tracking-tight flex items-center">Registration ID (Aadhar)</div>
                        <div className="col-span-8 font-mono text-xl font-bold text-green-700">{citizen.aadharNumber}</div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-gray-200 pb-2">
                        <div className="col-span-4 font-bold text-gray-600 uppercase tracking-tight">Full Name</div>
                        <div className="col-span-8 font-bold text-lg uppercase">{citizen.name}</div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-gray-200 pb-2">
                        <div className="col-span-4 font-bold text-gray-600 uppercase tracking-tight">Date of Birth</div>
                        <div className="col-span-8 uppercase">{citizen.dateOfBirth}</div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-gray-200 pb-2">
                        <div className="col-span-4 font-bold text-gray-600 uppercase tracking-tight">Gender</div>
                        <div className="col-span-8 uppercase">{citizen.gender}</div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-gray-200 pb-2">
                        <div className="col-span-4 font-bold text-gray-600 uppercase tracking-tight">Constituency</div>
                        <div className="col-span-8 font-bold uppercase">{citizen.constituency}</div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-gray-200 pb-2">
                        <div className="col-span-4 font-bold text-gray-600 uppercase tracking-tight">District</div>
                        <div className="col-span-8 uppercase">{citizen.district}</div>
                    </div>

                    <div className="grid grid-cols-12 border-b border-gray-200 pb-2">
                        <div className="col-span-4 font-bold text-gray-600 uppercase tracking-tight">Registration Date</div>
                        <div className="col-span-8 uppercase">{new Date(registration.registeredAt).toLocaleDateString()}</div>
                    </div>

                    <div className="grid grid-cols-12 pt-2">
                        <div className="col-span-4 font-bold text-gray-600 uppercase tracking-tight">Address</div>
                        <div className="col-span-8 uppercase leading-tight whitespace-pre-wrap">{citizen.address}</div>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="absolute bottom-20 left-12 right-12 z-10 flex justify-between items-end border-t-2 border-green-800 pt-8">
                <div className="text-left">
                    <div className="mb-4">
                        <img src="/uploads/health_seal.png" alt="Official Seal" className="h-24 w-auto grayscale mix-blend-multiply opacity-80" />
                    </div>
                    <p className="text-[10px] font-bold uppercase mt-1">Date: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="text-right">
                    <div className="mb-6 h-12">
                        {/* Placeholder for digital signature */}
                        <p className="text-[#0D6B4F] font-bold italic border-b border-gray-400 inline-block px-4">Digitally Signed</p>
                    </div>
                    <div className="text-[10px] font-bold leading-tight uppercase">
                        Registration Officer<br />
                        Election Commission Of India
                    </div>
                </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="absolute bottom-8 left-12 right-12 z-10 text-center text-[9px] leading-tight text-gray-500">
                <p className="font-bold">This is a system-generated document based on verified Aadhar database credentials.</p>
                <p>No physical signature is required. The authenticity can be verified via the Digital Voting Portal.</p>
            </div>
        </div>
    );
}
