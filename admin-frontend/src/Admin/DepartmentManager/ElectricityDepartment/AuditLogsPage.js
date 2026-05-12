import React, {
  useState,
  useEffect,
} from "react";

import axios from "axios";

import io from "socket.io-client";

import {
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";

import {

  ResponsiveContainer,

  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,

  PieChart,
  Pie,
  Cell,

  LineChart,
  Line,

} from "recharts";

/* ================= STATUS COLORS ================= */

const statusColors = {
  Pending: "#facc15",
  "In Progress": "#38bdf8",
  Resolved: "#22c55e",
  Escalated: "#ef4444",
  Rejected: "#991b1b",
};

const COLORS = [
  "#facc15",
  "#22c55e",
  "#ef4444",
  "#991b1b",
];

const AuditLogsPage = ({
  departmentName =
    "Electricity Department",
}) => {

  /* ================= STATES ================= */

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  /* ================= SOCKET ================= */

  useEffect(() => {

    const socket =
      io("http://localhost:5000");

    socket.on(
      "complaintUpdated",
      (data) => {

        setComplaints((prev) =>
          prev.map((c) =>
            c.complaintId ===
            data.complaintId
              ? data
              : c
          )
        );
      }
    );

    socket.on(
      "newComplaint",
      (data) => {

        setComplaints((prev) => [
          data,
          ...prev,
        ]);
      }
    );

    return () =>
      socket.disconnect();

  }, []);

  /* ================= FETCH ================= */

  useEffect(() => {

    const fetchComplaints =
      async () => {

        try {

          const res =
            await axios.get(
              "http://localhost:5000/api/complaints/all"
            );

          if (
            res.data.success
          ) {

            const electricityData =
              res.data.complaints.filter(
                (c) => {

                  const dept =
                    (
                      c.department ||
                      ""
                    )
                      .toLowerCase();

                  return (

                    dept.includes(
                      "electricity"
                    ) ||

                    dept.includes(
                      "street light"
                    ) ||

                    dept.includes(
                      "streetlight"
                    )
                  );
                }
              );

            setComplaints(
              electricityData
            );
          }

        } catch (error) {

          console.log(error);
        }
      };

    fetchComplaints();

  }, []);

  /* ================= FILTER ================= */

  const filteredComplaints =
    complaints.filter((c) => {

      const matchesSearch =

        c.complaintId
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        c.ward
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        c.issue
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesStatus =

        statusFilter ===
          "All" ||

        c.status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  /* ================= TIMELINE ================= */

  const getTimelineWidth =
    (c) => {

      if (c.resolvedAt)
        return "100%";

      if (c.visitedAt)
        return "75%";

      if (c.assignedAt)
        return "50%";

      return "25%";
    };

  /* ================= REPORTS ================= */

  const totalComplaints =
    complaints.length;

  const resolvedComplaints =
    complaints.filter(
      (c) =>
        c.status ===
        "Resolved"
    ).length;

  const escalatedComplaints =
    complaints.filter(
      (c) =>
        c.status ===
        "Escalated"
    ).length;

  const weeklyComplaints =
    complaints.filter((c) => {

      const created =
        new Date(
          c.createdAt
        );

      const now =
        new Date();

      const diff =
        now - created;

      return (
        diff <=
        7 *
          24 *
          60 *
          60 *
          1000
      );
    }).length;

  const monthlyComplaints =
    complaints.filter((c) => {

      const d =
        new Date(
          c.createdAt
        );

      const now =
        new Date();

      return (
        d.getMonth() ===
          now.getMonth() &&
        d.getFullYear() ===
          now.getFullYear()
      );
    }).length;

  const yearlyComplaints =
    complaints.filter((c) => {

      const d =
        new Date(
          c.createdAt
        );

      const now =
        new Date();

      return (
        d.getFullYear() ===
        now.getFullYear()
      );
    }).length;

  /* ================= CHART DATA ================= */

  const statusChartData = [

    {
      name: "Pending",
      value:
        complaints.filter(
          (c) =>
            c.status ===
            "Pending"
        ).length,
    },

    {
      name: "Resolved",
      value:
        complaints.filter(
          (c) =>
            c.status ===
            "Resolved"
        ).length,
    },

    {
      name: "Escalated",
      value:
        complaints.filter(
          (c) =>
            c.status ===
            "Escalated"
        ).length,
    },

    {
      name: "Rejected",
      value:
        complaints.filter(
          (c) =>
            c.status ===
            "Rejected"
        ).length,
    },

  ];

  const monthlyChartData = [

    {
      name: "Weekly",
      complaints:
        weeklyComplaints,
    },

    {
      name: "Monthly",
      complaints:
        monthlyComplaints,
    },

    {
      name: "Yearly",
      complaints:
        yearlyComplaints,
    },

  ];

  return (

    <div style={pageStyle}>

      <h2>
        {departmentName}
        {" "}
        – Complaint Audit Logs
      </h2>

      {/* ================= REPORT CARDS ================= */}

      <div style={reportGrid}>

        <div style={reportCard}>
          <h3>Total</h3>
          <h1>
            {
              totalComplaints
            }
          </h1>
        </div>

        <div style={reportCard}>
          <h3>Weekly</h3>
          <h1>
            {
              weeklyComplaints
            }
          </h1>
        </div>

        <div style={reportCard}>
          <h3>Monthly</h3>
          <h1>
            {
              monthlyComplaints
            }
          </h1>
        </div>

        <div style={reportCard}>
          <h3>Yearly</h3>
          <h1>
            {
              yearlyComplaints
            }
          </h1>
        </div>

        <div style={reportCard}>
          <h3>Resolved</h3>
          <h1>
            {
              resolvedComplaints
            }
          </h1>
        </div>

        <div style={reportCard}>
          <h3>Escalated</h3>
          <h1>
            {
              escalatedComplaints
            }
          </h1>
        </div>

      </div>

      {/* ================= CHART SECTION ================= */}

      <div style={chartGrid}>

        {/* BAR CHART */}

        <div style={chartCard}>

          <h3>
            Complaint Analytics
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={
                monthlyChartData
              }
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="complaints"
                fill="#2563eb"
                radius={[
                  10, 10, 0, 0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* PIE CHART */}

        <div style={chartCard}>

          <h3>
            Complaint Status
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={
                  statusChartData
                }
                dataKey="value"
                outerRadius={110}
                label
              >

                {statusChartData.map(
                  (
                    entry,
                    index
                  ) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index
                        ]
                      }
                    />
                  )
                )}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* ================= LINE CHART ================= */}

      <div style={chartCard}>

        <h3>
          Complaint Growth
        </h3>

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <LineChart
            data={
              monthlyChartData
            }
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="name"
            />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="complaints"
              stroke="#22c55e"
              strokeWidth={4}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* ================= SEARCH ================= */}

      <div
        style={{
          display: "flex",
          gap: 15,
          margin:
            "20px 0",
        }}
      >

        <input
          type="text"
          placeholder="Search by ID / Ward / Issue"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          style={inputStyle}
        >

          <option value="All">
            All
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Resolved">
            Resolved
          </option>

          <option value="Escalated">
            Escalated
          </option>

          <option value="Rejected">
            Rejected
          </option>

        </select>

      </div>

      {/* ================= TABLE ================= */}

      <div
        style={{
          overflowX: "auto",
        }}
      >

        <table style={tableStyle}>

          <thead>

            <tr>

              <th style={thStyle}>
                Complaint ID
              </th>

              <th style={thStyle}>
                Ward
              </th>

              <th style={thStyle}>
                Sub Categories
              </th>

              <th style={thStyle}>
                Officer
              </th>

              <th style={thStyle}>
                Status
              </th>

              <th style={thStyle}>
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredComplaints.map(
              (c, index) => (

                <tr key={index}>

                  <td style={tdStyle}>
                    {
                      c.complaintId
                    }
                  </td>

                  <td style={tdStyle}>
                    {c.ward}
                  </td>

                  <td style={tdStyle}>

                    {Array.isArray(
                      c.subcategories
                    )
                      ? c.subcategories.join(
                          ", "
                        )
                      : "-"}

                  </td>

                  <td style={tdStyle}>
                    {
                      c.assignedOfficer
                    }
                  </td>

                  <td style={tdStyle}>

                    <span
                      style={{
                        background:
                          statusColors[
                            c.status
                          ],

                        padding:
                          "6px 12px",

                        borderRadius:
                          20,

                        fontWeight:
                          "bold",

                        color:
                          "#fff",
                      }}
                    >
                      {c.status}
                    </span>

                  </td>

                  <td style={tdStyle}>

                    <button
                      style={
                        viewBtn
                      }
                      onClick={() =>
                        setSelectedComplaint(
                          c
                        )
                      }
                    >
                      View
                    </button>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

      {/* ================= MODAL ================= */}

      {selectedComplaint && (

        <div style={modalOverlay}>

          <div style={modalContent}>

            <h2>
              {
                selectedComplaint.complaintId
              }
              {" "}
              Details
            </h2>

            <p>

              <strong>
                Contact:
              </strong>

              {" "}
              {
                selectedComplaint.contactNumber
              }

            </p>

            <p>

              <strong>
                Location:
              </strong>

              {" "}
              {
                selectedComplaint.location
              }

            </p>

            <p>

              <strong>
                Ward:
              </strong>

              {" "}
              {
                selectedComplaint.ward
              }

            </p>

            <p>

              <strong>
                Officer:
              </strong>

              {" "}
              {
                selectedComplaint.assignedOfficer
              }

            </p>

            <p>

              <strong>
                Designation:
              </strong>

              {" "}
              {
                selectedComplaint.designation
              }

            </p>

            <p>

              <strong>
                Sub Categories:
              </strong>

              {" "}
              {Array.isArray(
                selectedComplaint.subcategories
              )
                ? selectedComplaint.subcategories.join(
                    ", "
                  )
                : "-"}

            </p>

            {/* ================= RESOLVED DETAILS ================= */}

            {selectedComplaint.status ===
              "Resolved" && (

              <div style={resolvedBox}>

                <h3>
                  Complaint Resolution Details
                </h3>

                <p>

                  <strong>
                    Resolved By:
                  </strong>

                  {" "}
                  {
                    selectedComplaint.assignedOfficer
                  }

                </p>

                <p>

                  <strong>
                    Resolution Time:
                  </strong>

                  {" "}
                  {
                    selectedComplaint.resolvedAt
                  }

                </p>

                <p>

                  <strong>
                    Site Visit:
                  </strong>

                  {" "}
                  {
                    selectedComplaint.siteVisit
                  }

                </p>

                <p>

                  <strong>
                    Officer Remarks:
                  </strong>

                  {" "}
                  {
                    selectedComplaint.remarks
                  }

                </p>

              </div>
            )}

            {/* ================= IMAGE ================= */}

            {selectedComplaint.image && (

              <img
                src={`http://localhost:5000/uploads/${selectedComplaint.image}`}
                alt="Complaint"
                style={imageStyle}
              />
            )}

            {/* ================= MAP ================= */}

            {selectedComplaint.latitude && (

              <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">

                <GoogleMap
                  mapContainerStyle={
                    mapStyle
                  }
                  center={{
                    lat:
                      selectedComplaint.latitude,

                    lng:
                      selectedComplaint.longitude,
                  }}
                  zoom={14}
                >

                  <Marker
                    position={{
                      lat:
                        selectedComplaint.latitude,

                      lng:
                        selectedComplaint.longitude,
                    }}
                  />

                </GoogleMap>

              </LoadScript>
            )}

            {/* ================= TIMELINE ================= */}

            <div
              style={{
                marginTop: 30,
              }}
            >

              <h3>
                Complaint Progress
              </h3>

              <div
                style={
                  timelineContainer
                }
              >

                <div
                  style={{
                    ...timelineProgress,

                    width:
                      getTimelineWidth(
                        selectedComplaint
                      ),
                  }}
                />

              </div>

              <div
                style={
                  timelineLabels
                }
              >

                <span>
                  Registered
                </span>

                <span>
                  Assigned
                </span>

                <span>
                  Visited
                </span>

                <span>
                  Resolved
                </span>

              </div>

            </div>

            <div
              style={{
                marginTop: 25,
              }}
            >

              <button
                onClick={() =>
                  setSelectedComplaint(
                    null
                  )
                }
                style={closeBtn}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/* ================= STYLES ================= */

const pageStyle = {
  padding: 25,
  background: "#f8fafc",
  minHeight: "100vh",
};

const reportGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  marginBottom: 25,
};

const reportCard = {
  background: "#fff",
  padding: 20,
  borderRadius: 14,
  boxShadow:
    "0 4px 15px rgba(0,0,0,0.05)",
  textAlign: "center",
};

const chartGrid = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: 20,
  marginBottom: 25,
};

const chartCard = {
  background: "#fff",
  padding: 20,
  borderRadius: 14,
  boxShadow:
    "0 4px 15px rgba(0,0,0,0.05)",
  marginBottom: 25,
};

const inputStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse",
  marginTop: 20,
  background: "#fff",
};

const thStyle = {
  padding: 14,
  borderBottom:
    "2px solid #ddd",
  background: "#f1f5f9",
};

const tdStyle = {
  padding: 14,
  textAlign: "center",
  borderBottom:
    "1px solid #e5e7eb",
};

const viewBtn = {
  background: "#2563eb",
  color: "#fff",
  padding: "8px 15px",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background:
    "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent:
    "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalContent = {
  background: "#fff",
  padding: 25,
  width: "750px",
  borderRadius: 15,
  maxHeight: "90vh",
  overflowY: "auto",
};

const imageStyle = {
  width: "100%",
  borderRadius: 10,
  marginTop: 15,
};

const mapStyle = {
  width: "100%",
  height: "260px",
  marginTop: 20,
};

const resolvedBox = {
  background: "#ecfdf5",
  padding: 18,
  borderRadius: 10,
  marginTop: 20,
  border:
    "1px solid #bbf7d0",
};

const timelineContainer = {
  height: 12,
  background: "#e5e7eb",
  borderRadius: 10,
  overflow: "hidden",
};

const timelineProgress = {
  height: "100%",
  background: "#22c55e",
  borderRadius: 10,
};

const timelineLabels = {
  display: "flex",
  justifyContent:
    "space-between",
  marginTop: 10,
  fontSize: 13,
  color: "#64748b",
};

const closeBtn = {
  padding: "10px 18px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

export default AuditLogsPage;