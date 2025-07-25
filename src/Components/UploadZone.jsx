import React, { useState, useRef, useEffect } from 'react';

const UploadZone = ({ title, type, fileFormats, multiple, errorFile }) => {
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState([]);
  const [onDrag, setOnDrag] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e) => {
    preventDefaults(e);
    setOnDrag(true);
  };


  const handleDrop = (e) => {
    preventDefaults(e);
    setOnDrag(false);

    const droppedFile =  e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    if (droppedFile) {
      setUploadedFile(droppedFile);
      setFileName([droppedFile]);
    };
  };

  const handleClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setFileName([file]);
    }
  };

  useEffect(() => {
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  const file = uploadedFile || fileInputRef.current?.files[0];
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("https://file-nest-api.onrender.com/convert/pdf-to-word", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Conversion failed");
    }

    const data = await response.json();

    if ( data.downloadURL) {
      const link = document.createElement('a');
      link.href = data.downloadURL;
      link.setAttribute('download', data.fileName || 'converted-file.docx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

  } catch (error) {
    console.error("Upload or conversion failed:", error);
    alert("Something went wrong during conversion.");
  }
};

  return (
    <>
          <form encType='multipart/form-data' onSubmit={handleSubmit}>
        <div
          className={`flex flex-col items-center h-full w-full`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <h2 className='text-3xl md:text-4xl font-bold my-5'>{title}</h2>
          <div className={`drop-zone w-100 relative border-2 mx-auto rounded-xl border-[var(--secondary-bg)] bg-[var(--primary-card-bg)] text-[var(--primary-text)] flex flex-col items-center justify-center p-10 cursor-pointer hover:border-[var(--primary-btn)] transition ${onDrag ? 'border-dashed' : ''}`}>
            <input
              ref={fileInputRef}
              onChange={handleFileChange}
              type='file'
              name='file'
              accept={fileFormats}
              multiple={multiple}
              className='hidden'
            />
            {fileName.length === 0 ? (
              <h3>{type}</h3>
            ) : (
              <ul>
                {fileName.map((file, f) => (
                  <li key={f}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          {onDrag && (
            <div className='h-full w-full flex items-center justify-center on-drag'>
              <h1 className='text-3xl text-white font-black'>Drop it</h1>
            </div>
          )}
        </div>

        <button type='submit'>Convert</button>
      </form>
    </>
  );
};

export default UploadZone;
