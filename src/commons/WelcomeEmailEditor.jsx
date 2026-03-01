import React, { useEffect } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const WelcomeEmailEditor = ({ emailBody, setEmailBody }) => {
  const { quill, quillRef } = useQuill({
    theme: "snow",
  });

  // 🔥 Load template when emailBody changes
useEffect(() => {
  if (!quill) return;
  if (!emailBody) return;

  const currentHTML = quill.root.innerHTML;

  // Only load if editor is still empty
  const editorIsEmpty =
    currentHTML === "<p><br></p>" || currentHTML.trim() === "";

  if (editorIsEmpty) {
    quill.clipboard.dangerouslyPasteHTML(emailBody);
  }
}, [quill, emailBody]);

  // 🔥 Update state when user edits
  useEffect(() => {
    if (!quill) return;

    const handler = () => {
      setEmailBody(quill.root.innerHTML);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [quill, setEmailBody]);

  return (
    <div>
      <div ref={quillRef} style={{ height: "400px" }} />
    </div>
  );
};

export default WelcomeEmailEditor;