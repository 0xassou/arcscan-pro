import { type CSSProperties, type ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  align?: "left" | "center" | "right";
  mono?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
}

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontWeight: 600,
  fontSize: 11,
  color: "#9CA3AF",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #E2E5EA",
};

const tdStyle: CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #F3F4F6",
  color: "#0D1117",
};

const rowHover = "#FAFBFC";

export function Table<T>({ columns, data, loading }: TableProps<T>) {
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ ...thStyle, textAlign: col.align ?? "left" }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = rowHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    ...tdStyle,
                    textAlign: col.align ?? "left",
                    fontFamily: col.mono
                      ? "var(--font-dm-mono), monospace"
                      : "inherit",
                  }}
                >
                  {col.render(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
