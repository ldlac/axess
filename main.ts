import MDBReader from "./mdb-parser/MDBReader";

let db: MDBReader | null = null;

const uploadArea = document.getElementById("uploadArea") as HTMLDivElement;
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const mainContent = document.getElementById("mainContent") as HTMLDivElement;
const tableList = document.getElementById("tableList") as HTMLDivElement;
const tableContainer = document.getElementById(
  "tableContainer",
) as HTMLDivElement;
const currentTableEl = document.getElementById(
  "currentTable",
) as HTMLSpanElement;
const dataInfo = document.getElementById("dataInfo") as HTMLSpanElement;
const loading = document.getElementById("loading") as HTMLDivElement;
const errorMessage = document.getElementById("errorMessage") as HTMLDivElement;
const fileInfo = document.getElementById("fileInfo") as HTMLDivElement;
const fileName = document.getElementById("fileName") as HTMLSpanElement;
const closeFile = document.getElementById("closeFile") as HTMLButtonElement;

function showError(message: string): void {
  errorMessage.textContent = message;
  errorMessage.classList.add("visible");
}

function hideError(): void {
  errorMessage.classList.remove("visible");
}

function showLoading(): void {
  loading.classList.add("visible");
  uploadArea.classList.add("hidden");
  mainContent.classList.remove("visible");
}

function hideLoading(): void {
  loading.classList.remove("visible");
}

function handleFile(file: File): void {
  if (!file) return;

  const validExtensions = [".mdb", ".accdb"];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

  if (!validExtensions.includes(ext)) {
    showError(
      "Please upload a valid Microsoft Access database file (.mdb or .accdb)",
    );
    return;
  }

  hideError();
  showLoading();

  const reader = new FileReader();

  reader.onload = function (e: ProgressEvent<FileReader>): void {
    try {
      const result = e.target?.result;
      if (!result || typeof result === "string") {
        throw new Error("Failed to read file");
      }
      const arrayBuffer = result as ArrayBuffer;
      console.log("File size:", arrayBuffer.byteLength);
      const uint8Array = new Uint8Array(arrayBuffer);
      db = new MDBReader(uint8Array);
      const tables = db.getTableNames();
      console.log("Tables found:", tables);

      if (!tables || tables.length === 0) {
        hideLoading();
        showError(
          "No tables found in this database. Check console for debug info.",
        );
        return;
      }

      renderTableList(tables);

      hideLoading();
      uploadArea.classList.add("hidden");
      mainContent.classList.add("visible");
      fileName.textContent = file.name;
      fileInfo.classList.add("visible");

      if (tables.length > 0) {
        selectTable(tables[0]);
      }
    } catch (err) {
      hideLoading();
      console.error("Error parsing database:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      showError(`Error parsing database: ${errorMessage}`);
    }
  };

  reader.onerror = function (): void {
    hideLoading();
    showError("Error reading file");
  };

  reader.readAsArrayBuffer(file);
}

function renderTableList(tables: string[]): void {
  tableList.innerHTML = "";

  tables.forEach((tableName) => {
    const div = document.createElement("div");
    div.className = "table-item";
    div.dataset.table = tableName;
    div.innerHTML = `
      <div class="table-name">${tableName}</div>
    `;

    div.addEventListener("click", () => selectTable(tableName));
    tableList.appendChild(div);
  });
}

function selectTable(tableName: string): void {
  document.querySelectorAll<HTMLElement>(".table-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.table === tableName);
  });

  currentTableEl.textContent = tableName;

  if (!db) return;

  try {
    const table = db.getTable(tableName);
    const rows = table.getData();
    renderTableData(tableName, rows);
    dataInfo.textContent = `${rows.length} row${rows.length !== 1 ? "s" : ""}`;
  } catch (err) {
    console.error("Error loading table:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    tableContainer.innerHTML = `<div class="empty-state">Error loading table: ${errorMessage}</div>`;
  }
}

function renderTableData(
  _tableName: string,
  rows: Record<string, unknown>[],
): void {
  if (!rows || rows.length === 0) {
    tableContainer.innerHTML =
      '<div class="empty-state">This table is empty</div>';
    return;
  }

  const columns = Object.keys(rows[0]);

  let html = "<table><thead><tr>";
  columns.forEach((col) => {
    html += `<th>${col}</th>`;
  });
  html += "</tr></thead><tbody>";

  rows.forEach((row) => {
    html += "<tr>";
    columns.forEach((col) => {
      const value = row[col];
      const displayValue = formatValue(value);
      html += `<td>${escapeHtml(displayValue)}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  tableContainer.innerHTML = html;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "bigint") return value.toString();
  return String(value);
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function resetApp(): void {
  db = null;
  mainContent.classList.remove("visible");
  uploadArea.classList.remove("hidden");
  fileInfo.classList.remove("visible");
  tableContainer.innerHTML =
    '<div class="empty-state">Select a table to view its data</div>';
  currentTableEl.textContent = "Select a table";
  dataInfo.textContent = "";
  hideError();
}

uploadArea.addEventListener("click", () => fileInput.click());

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
  const file = e.dataTransfer?.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener("change", (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) handleFile(file);
});

closeFile.addEventListener("click", resetApp);
