const files = [
    { title: "Work Documents", size: "0.99 MB", attachments: 2, sentTo: "Kolade Bello", destination: "koladebello@gmail.com", status: "Not Viewed", date: "12/12/25" },
    { title: "My CV", size: "120 MB", attachments: 1, sentTo: "Mustapha Garuba", destination: "mustaphagaruba@gmail.com", status: "Not Viewed", date: "12/12/25" },
    { title: "Documents", size: "12 MB", attachments: 5, sentTo: "Chukwudi Yaro", destination: "chukwudiyaro@gmail.com", status: "Expired", date: "12/12/25" },
    { title: "License", size: "10 MB", attachments: 7, sentTo: "Nnamdi Kalu", destination: "nnamdiokafor@gmail.com", status: "Viewed", date: "12/12/25" },
    { title: "Work", size: "17 MB", attachments: 1, sentTo: "Eugene Benson", destination: "eugenebenson@company.com", status: "Viewed", date: "12/12/25" },
];

export default function SharedHistory() {
    return (
        <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Shared History</h2>
            <table className="w-full text-left">
                <thead>
                <tr className="text-gray-600 text-sm border-b">
                    <th className="py-2">Title</th>
                    <th>Size</th>
                    <th>Attachments</th>
                    <th>Sent to</th>
                    <th>Destination</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody className="text-sm">
                {files.map((file, idx) => (
                    <tr key={idx} className="border-b">
                        <td className="py-2">{file.title}</td>
                        <td>{file.size}</td>
                        <td>{file.attachments}</td>
                        <td>{file.sentTo}</td>
                        <td>{file.destination}</td>
                        <td>
                <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                        file.status === "Viewed"
                            ? "bg-green-500"
                            : file.status === "Expired"
                                ? "bg-gray-400"
                                : "bg-red-500"
                    }`}
                >
                  {file.status}
                </span>
                        </td>
                        <td>{file.date}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
