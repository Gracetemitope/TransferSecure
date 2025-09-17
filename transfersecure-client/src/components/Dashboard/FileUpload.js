function FileUpload() {
    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-purple-50">
            <div className="text-4xl text-indigo-500">📄</div>
            <p className="mt-2 font-medium">Drag & Drop files here</p>
            <p className="text-sm text-gray-500">
                Or <span className="text-indigo-600 cursor-pointer">Browse</span> files from computer
            </p>
        </div>
    );
}

export default FileUpload;
