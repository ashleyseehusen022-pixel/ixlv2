
import JSZip from 'jszip';

export const downloadProjectZip = async (currentFiles: Record<string, string>) => {
  try {
    const zip = new JSZip();

    // Add all files provided in the parameter to the ZIP
    Object.entries(currentFiles).forEach(([path, content]) => {
      // Create subdirectories if needed (jszip handles this with paths)
      zip.file(path, content);
    });

    // Generate the ZIP blob
    const blob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    // Create a download link and click it
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'phonk-systems-source.zip';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (err) {
    console.error("ZIP Generation Failed:", err);
    alert("CRITICAL ERROR: FAILED TO GENERATE SOURCE ZIP.");
  }
};
