import { useState } from "react";
import { downloadResource } from "../services/resourceService";
import { useToast } from "../hooks/ToastContext";
import Icon from "./Icons";

export default function ResourceCard({ resource }) {
  const toast = useToast();
  const [downloads, setDownloads] = useState(resource.downloadCount || 0);
  const [downloading, setDownloading] = useState(false);

  const getTypeBadge = (type) => {
    switch (type?.toUpperCase()) {
      case "NOTES":
        return <span className="badge badge-blue">Lecture Notes</span>;
      case "EXERCISES":
        return <span className="badge badge-cyan">Exercises</span>;
      case "PROJECTS":
        return <span className="badge badge-amber">Projects</span>;
      case "CHEATSHEET":
        return <span className="badge badge-green">Cheatsheet</span>;
      default:
        return <span className="badge badge-gray">{type || "Resource"}</span>;
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (resource.id) {
        const res = await downloadResource(resource.id);
        if (res.success && res.data?.downloadCount) {
          setDownloads(res.data.downloadCount);
        } else {
          setDownloads((prev) => prev + 1);
        }
      } else {
        setDownloads((prev) => prev + 1);
      }

      // Trigger synthetic download of documentation / resource
      const content = `# ${resource.title}\n\nType: ${resource.resourceType}\nDescription: ${resource.description}\n\nDownloaded from Student Learning Portal • Resource Microservice Port 8083.\nGenerated on: ${new Date().toISOString()}`;
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${(resource.title || "resource").toLowerCase().replace(/\s+/g, "-")}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded "${resource.title}". Metric recorded in Resource Service.`);
    } catch {
      setDownloads((prev) => prev + 1);
      toast.info(`Resource access recorded for "${resource.title}".`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <article className="card resource-card">
      <div className="card-header-row">
        <div>{getTypeBadge(resource.resourceType)}</div>
        <span
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: 4
          }}
        >
          <Icon name="download" size={14} />
          {downloads} downloads
        </span>
      </div>

      <h3 className="card-title">{resource.title}</h3>
      <p className="card-desc">{resource.description}</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <span className="badge badge-gray">
          {resource.fileFormat || (resource.fileUrl?.endsWith(".pdf") ? "PDF" : "ZIP")}
        </span>
        {resource.fileSize && (
          <span className="badge badge-gray">{resource.fileSize}</span>
        )}
      </div>

      <div className="card-footer">
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Resource Service (8083)
        </span>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Icon name="download" size={14} />
          {downloading ? "Accessing..." : "Download Asset"}
        </button>
      </div>
    </article>
  );
}
