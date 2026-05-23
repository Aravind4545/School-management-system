export default function PdfViewer({ url, title }) {
  const src = url?.startsWith('/') ? url : url;
  return (
    <div className="bg-white rounded-2xl shadow-premium overflow-hidden border border-navy/10">
      <div className="bg-navy text-gold px-6 py-4 font-semibold">{title}</div>
      <iframe src={src} title={title} className="w-full h-[70vh] min-h-[400px]" />
      <p className="text-sm text-navy/50 p-4">Place PDF files in frontend/public/samples/ for local viewing.</p>
    </div>
  );
}
