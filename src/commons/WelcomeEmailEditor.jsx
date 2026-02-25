import { useEffect } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { Paperclip } from "lucide-react";

const WelcomeEmailEditor = ({
  visible,
  subject,
  setSubject,
  attachments,
  setAttachments,
  emailBody,
  setEmailBody, // 👈 NEW
}) => {
  const { quill, quillRef } = useQuill({
    theme: "snow",
  });

  // Set editor content from state when opened
  useEffect(() => {
    if (quill && visible) {
      quill.root.innerHTML = emailBody || "";
    }
  }, [quill, visible]);

  // Listen for changes
  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        setEmailBody(quill.root.innerHTML);
      });
    }
  }, [quill]);

  if (!visible) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  return (
    <div className="mt-6 bg-gray-50 border rounded-xl shadow-sm p-5">
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Email Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
          placeholder="Enter email subject..."
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Email Body
        </label>
        <div className="bg-white border rounded-lg">
          <div ref={quillRef} style={{ height: "250px" }} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Attachments
        </label>

        <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 transition">
          <Paperclip size={16} />
          Attach Files
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (!files.length) return;

              setAttachments((prev) => [...prev, ...files]);
              e.target.value = null;
            }}
          />
        </label>

        {/* 🔥 SHOW SELECTED FILES */}
        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white border px-3 py-2 rounded-lg text-sm"
              >
                <span className="truncate max-w-xs">{file.name}</span>

                <button
                  type="button"
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-red-500 hover:text-red-700 text-xs font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeEmailEditor;
