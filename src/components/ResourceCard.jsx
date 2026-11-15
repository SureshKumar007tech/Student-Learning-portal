import { useState } from "react";
import { downloadResource } from "../services/resourceService";
import { useToast } from "../hooks/ToastContext";
import Icon from "./Icons";
import { Spinner, fileFormatFromUrl, resourceTypeInfo } from "./ui";

function isExternalUrl(url) {
  return /^https?:\/\//i.test(url || "");
}

export default function ResourceCard({ resource }) {
  const toast = useToast();
  const [downloads, setDownloads] = useState(resource.downloadCount);
  const [downloading, setDownloading] = useState(false);

  const type = resourceTypeInfo(resource.resourceType);
  const format = resource.fileFormat || fileFormatFromUrl(resource.fileUrl);

  const handleDownload = async () => {
    if (!resource.id) return;
    setDownloading(true);
    try {
      // The download is only recorded/started once the Resource API confirms it
      const res = await downloadResource(resource.id);
      if (!res.success) {
        toast.error(res.error || "This resource couldn't be downloaded. Please try again.");
        return;
      }
      if (typeof res.data?.downloadCount === "number") setDownloads(res.data.downloadCount);

      if (isExternalUrl(resource.fileUrl)) {
        window.open(resource.fileUrl, "_blank", "noopener,noreferrer");
      } else {
        // No hosted file is attached — provide a summary sheet of the resource
        const content = `# ${resource.title}\n\nType: ${type.label}\n\n${resource.description || ""}\n\nDownloaded from Student Learning Portal on ${new Date().toLocaleString()}.\n`;
        const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${(resource.title || "resource").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      toast.success(`${resource.title} is downloading.`, "Download started");
    } catch {
      toast.error("This resource couldn't be downloaded. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <article className="card card-interactive">
      <div className="card-header-row">
        <span className={`badge ${type.badge}`}>
          <Icon name={type.icon} size={12} />
          {type.label}
        </span>
        {format && <span className="badge badge-neutral badge-mono">{format}</span>}
      </div>

      <h3 className="card-title">{resource.title}</h3>
      {resource.description && <p className="card-desc">{resource.description}</p>}

      <div className="card-footer">
        <span className="small muted">
          {typeof downloads === "number" ? `${downloads.toLocaleString()} download${downloads === 1 ? "" : "s"}` : ""}
          {resource.fileSize ? ` · ${resource.fileSize}` : ""}
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleDownload}
          disabled={downloading || !resource.id}
          aria-label={`Download ${resource.title}`}
          aria-busy={downloading}
        >
          {downloading ? <Spinner /> : <Icon name="download" size={14} />}
          {downloading ? "Preparing…" : "Download"}
        </button>
      </div>
    </article>
  );
}
