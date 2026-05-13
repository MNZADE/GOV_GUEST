import React, {
  useState,
  useEffect,
} from "react";

import {
  Search,
  Eye,
  X,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const ComplaintsPage = () => {

  /* ================= STATES ================= */

  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [
    currentImage,
    setCurrentImage,
  ] = useState(0);

  const [
    statusDraft,
    setStatusDraft,
  ] = useState({});

  /* ================= FETCH COMPLAINTS ================= */

  useEffect(() => {

    fetchComplaints();

  }, []);

  const fetchComplaints =
    async () => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const user = JSON.parse(
          localStorage.getItem(
            "kmc_user"
          )
        );

        let department =
          "sanitation";

        if (
          user?.department
        ) {

          department =
            user.department
              .toLowerCase()
              .replace(
                " department",
                ""
              )
              .trim();
        }

        const response =
          await fetch(

            `http://localhost:5000/api/complaints/manager/${department}`,

            {

              method: "GET",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        console.log(
          "Complaints:",
          data
        );

        if (
          response.ok &&
          data.success
        ) {

          const formatted =
            (data.complaints ||
              []).map((c) => ({

              id:
                c.complaintId ||
                c._id,

              mongoId:
                c._id,

              title:
                c.issue ||
                "Complaint",

              issue:
                c.issue ||
                "Complaint",

              subCategory:

                Array.isArray(
                  c.subcategories
                )

                  ? c.subcategories.join(
                      ", "
                    )

                  : c.subcategories ||
                    "General",

              address:
                c.address ||
                c.location ||
                "N/A",

              description:
                c.description ||
                "No description",

              aadhaar:
                c.aadhaar,

              phone:
                c.phone,

              citizenName:
                c.name,

              status:
                c.status ||
                "Pending",

              priority:
                c.priority ||
                "Medium",

              createdAt:
                c.createdAt,

              formattedDate:
                new Date(
                  c.createdAt
                ).toLocaleString(),

              images:

                c.images &&
                c.images.length >
                  0

                  ? c.images.map(
                      (img) =>

                        img.startsWith(
                          "http"
                        )

                          ? img

                          : `http://localhost:5000/uploads/${img}`
                    )

                  : [
                      "https://via.placeholder.com/700x400",
                    ],

              latitude:
                c.latitude ||
                c.lat,

              longitude:
                c.longitude ||
                c.lon,

              adminMessage:
                c.adminMessage ||
                "No updates yet",
            }));

          setComplaints(
            formatted
          );
        }

      } catch (err) {

        console.log(
          "Fetch Error:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  /* ================= UPDATE STATUS ================= */

  const handleUpdate =
    async (id) => {

      try {

        if (!statusDraft[id]) {

          alert(
            "Please select status"
          );

          return;
        }

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const adminMessage =
          prompt(
            "Enter update message"
          );

        if (!adminMessage) {

          alert(
            "Admin message required"
          );

          return;
        }

        const complaint =
          complaints.find(
            (c) => c.id === id
          );

        const response =
          await fetch(

            `http://localhost:5000/api/complaints/manager/update/${id}`,

            {

              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({

                status:
                  statusDraft[id],

                priority:
                  complaint.priority,

                adminMessage,
              }),
            }
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success
        ) {

          alert(
            "Complaint Updated Successfully"
          );

          setComplaints(
            (prev) =>

              prev.map((c) =>

                c.id === id

                  ? {
                      ...c,

                      status:
                        statusDraft[
                          id
                        ],

                      adminMessage,
                    }

                  : c
              )
          );

        } else {

          alert(
            data.message
          );
        }

      } catch (err) {

        console.log(
          "Update Error:",
          err
        );

        alert(
          "Server Error"
        );
      }
    };

  /* ================= DELETE ================= */

  const handleDelete =
    async (
      complaintId,
      aadhaar
    ) => {

      try {

        const confirmDelete =
          window.confirm(
            "Are you sure you want to delete this complaint?"
          );

        if (
          !confirmDelete
        )
          return;

        const response =
          await fetch(

            `http://localhost:5000/api/complaints/user/${aadhaar}/${complaintId}`,

            {
              method: "DELETE",
            }
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success
        ) {

          alert(
            "Complaint Deleted"
          );

          setComplaints(
            (prev) =>

              prev.filter(
                (c) =>
                  c.id !==
                  complaintId
              )
          );

          setSelectedComplaint(
            null
          );
        }

      } catch (err) {

        console.log(err);

        alert(
          "Delete Failed"
        );
      }
    };

  /* ================= FILTER ================= */

  const filteredComplaints =
    complaints.filter((c) =>

      c.id
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      c.address
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      c.subCategory
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      c.issue
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div style={{
        padding:50,
        textAlign:"center",
        fontSize:24,
        fontWeight:700
      }}>
        Loading Complaints...
      </div>
    );
  }

  return (

    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.heading}>
            Complaint Management
          </h1>

          <p style={styles.subHeading}>
            Department Complaint Monitoring System
          </p>

        </div>

      </div>

      {/* SEARCH */}

      <div style={styles.searchBox}>

        <Search size={18} />

        <input
          type="text"

          placeholder="Search Complaint ID, Address, Issue..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          style={styles.searchInput}
        />

      </div>

      {/* TABLE */}

      <div style={styles.tableContainer}>

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>
                Complaint ID
              </th>

              <th style={styles.th}>
                Issue
              </th>

              <th style={styles.th}>
                Address
              </th>

              <th style={styles.th}>
                Priority
              </th>

              <th style={styles.th}>
                Status
              </th>

              <th style={styles.th}>
                Date & Time
              </th>

              <th style={styles.th}>
                Update
              </th>

              <th style={styles.th}>
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredComplaints.map(
              (c) => (

                <tr
                  key={c.id}

                  style={{
                    ...styles.row,

                    background:

                      c.priority ===
                      "Critical"

                        ? "#fef2f2"

                        : c.priority ===
                          "High"

                        ? "#fff7ed"

                        : "#fff",
                  }}
                >

                  <td style={styles.tdStrong}>
                    {c.id}
                  </td>

                  <td style={styles.td}>
                    {c.issue}
                  </td>

                  <td style={styles.td}>
                    {c.address}
                  </td>

                  <td style={styles.td}>

                    <PriorityBadge
                      priority={
                        c.priority
                      }
                    />

                  </td>

                  <td style={styles.td}>

                    <StatusBadge
                      status={
                        c.status
                      }
                    />

                  </td>

                  <td style={styles.td}>
                    {c.formattedDate}
                  </td>

                  <td style={styles.td}>

                    <div style={{
                      display:"flex",
                      gap:10
                    }}>

                      <select
                        style={{
                          ...styles.select,

                          background:

                            statusDraft[
                              c.id
                            ] ===
                            "Rejected"

                              ? "#fee2e2"

                              : "#fff",

                          color:

                            statusDraft[
                              c.id
                            ] ===
                            "Rejected"

                              ? "#991b1b"

                              : "#111827",
                        }}

                        value={
                          statusDraft[
                            c.id
                          ] ||
                          c.status
                        }

                        onChange={(e) =>
                          setStatusDraft({

                            ...statusDraft,

                            [c.id]:
                              e.target
                                .value,
                          })
                        }
                      >

                        <option>
                          Pending
                        </option>

                        <option>
                          In Progress
                        </option>

                        <option>
                          Escalated
                        </option>

                        <option>
                          Resolved
                        </option>

                        <option>
                          Rejected
                        </option>

                      </select>

                      <button
                        style={
                          styles.updateBtn
                        }

                        onClick={() =>
                          handleUpdate(
                            c.id
                          )
                        }
                      >

                        Update

                      </button>

                    </div>

                  </td>

                  <td style={styles.td}>

                    <button
                      style={
                        styles.viewBtn
                      }

                      onClick={() => {

                        setSelectedComplaint(
                          c
                        );

                        setCurrentImage(
                          0
                        );
                      }}
                    >

                      <Eye size={15} />

                      View

                    </button>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      {selectedComplaint && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>

                <h2 style={styles.modalTitle}>
                  Complaint Details
                </h2>

                <p style={styles.modalSubTitle}>
                  Complaint ID :
                  {" "}
                  {
                    selectedComplaint.id
                  }
                </p>

              </div>

              <button
                style={
                  styles.closeBtn
                }

                onClick={() =>
                  setSelectedComplaint(
                    null
                  )
                }
              >

                <X size={20} />

              </button>

            </div>

            {/* IMAGE SLIDER */}

            <div style={styles.sliderContainer}>

              <img
                src={
                  selectedComplaint
                    .images[
                      currentImage
                    ]
                }

                alt="complaint"

                style={
                  styles.modalImage
                }
              />

              {selectedComplaint
                .images.length >
                1 && (

                <button
                  style={
                    styles.prevBtn
                  }

                  onClick={() =>
                    setCurrentImage(

                      currentImage ===
                        0

                        ? selectedComplaint
                            .images
                            .length -
                            1

                        : currentImage -
                            1
                    )
                  }
                >

                  <ChevronLeft size={22} />

                </button>
              )}

              {selectedComplaint
                .images.length >
                1 && (

                <button
                  style={
                    styles.nextBtn
                  }

                  onClick={() =>
                    setCurrentImage(

                      currentImage ===
                        selectedComplaint
                          .images
                          .length -
                          1

                        ? 0

                        : currentImage +
                            1
                    )
                  }
                >

                  <ChevronRight size={22} />

                </button>
              )}

            </div>

            {/* BADGES */}

            <div style={styles.badgeRow}>

              <PriorityBadge
                priority={
                  selectedComplaint.priority
                }
              />

              <StatusBadge
                status={
                  selectedComplaint.status
                }
              />

            </div>

            {/* DETAILS */}

            <div style={styles.detailsGrid}>

              <InfoCard
                icon={<MapPin />}
                title="Address"
                value={
                  selectedComplaint.address
                }
              />

              <InfoCard
                icon={<Calendar />}
                title="Created At"
                value={
                  selectedComplaint.formattedDate
                }
              />

              <InfoCard
                icon={<AlertTriangle />}
                title="Issue"
                value={
                  selectedComplaint.issue
                }
              />

              <InfoCard
                icon={<Clock />}
                title="Status"
                value={
                  selectedComplaint.status
                }
              />

            </div>

            {/* DESCRIPTION */}

            <div style={styles.descriptionBox}>

              <h3>
                Description
              </h3>

              <p>
                {
                  selectedComplaint.description
                }
              </p>

            </div>

            {/* ADMIN MESSAGE */}

            <div style={styles.descriptionBox}>

              <h3>
                Admin Update
              </h3>

              <p>
                {
                  selectedComplaint.adminMessage
                }
              </p>

            </div>

            {/* MAP */}

            <div style={styles.mapContainer}>

              <iframe
                title="Complaint Location"

                width="100%"

                height="320"

                loading="lazy"

                allowFullScreen

                style={styles.mapFrame}

                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  selectedComplaint.address
                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              />

            </div>

            {/* DELETE */}

            <div style={{
              marginTop:30,
              textAlign:"right"
            }}>

              <button
                style={
                  styles.deleteBtn
                }

                onClick={() =>
                  handleDelete(
                    selectedComplaint.id,
                    selectedComplaint.aadhaar
                  )
                }
              >

                Delete Complaint

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/* ================= COMPONENTS ================= */

const InfoCard = ({
  icon,
  title,
  value,
}) => (

  <div style={styles.infoCard}>

    <div style={styles.infoIcon}>
      {icon}
    </div>

    <div>

      <small style={{
        color:"#6b7280"
      }}>
        {title}
      </small>

      <p style={{
        marginTop:6,
        fontWeight:600
      }}>
        {value}
      </p>

    </div>

  </div>
);

const PriorityBadge = ({
  priority,
}) => {

  const map = {

    Low: {
      bg:"#dcfce7",
      color:"#166534",
      border:"#22c55e",
    },

    Medium: {
      bg:"#fef3c7",
      color:"#92400e",
      border:"#f59e0b",
    },

    High: {
      bg:"#fee2e2",
      color:"#991b1b",
      border:"#ef4444",
    },

    Critical: {
      bg:"#7f1d1d",
      color:"#ffffff",
      border:"#991b1b",
    },
  };

  const style =
    map[priority] ||
    map["Medium"];

  return (

    <span style={{
      background: style.bg,
      color: style.color,
      border:
        `1px solid ${style.border}`,
      padding:"7px 16px",
      borderRadius:30,
      fontWeight:700,
      fontSize:12,
    }}>
      {priority}
    </span>
  );
};

const StatusBadge = ({
  status,
}) => {

  const map = {

    Pending: {
      bg:"#fef3c7",
      color:"#92400e",
      border:"#f59e0b",
    },

    Escalated: {
      bg:"#fee2e2",
      color:"#991b1b",
      border:"#ef4444",
    },

    Resolved: {
      bg:"#dcfce7",
      color:"#166534",
      border:"#22c55e",
    },

    "In Progress": {
      bg:"#dbeafe",
      color:"#1d4ed8",
      border:"#2563eb",
    },

    Rejected: {
      bg:"#111827",
      color:"#ffffff",
      border:"#111827",
    },
  };

  const style =
    map[status] ||
    map["Pending"];

  return (

    <span style={{
      display:"inline-flex",
      alignItems:"center",
      gap:6,
      background: style.bg,
      color: style.color,
      border:
        `1px solid ${style.border}`,
      padding:"7px 16px",
      borderRadius:30,
      fontWeight:700,
      fontSize:12,
    }}>

      {status === "Resolved" &&
        <CheckCircle2 size={14} />
      }

      {status === "Rejected" &&
        <XCircle size={14} />
      }

      {status}

    </span>
  );
};

/* ================= STYLES ================= */

const styles = {

  container:{
    padding:30,
    background:"#f3f4f6",
    minHeight:"100vh"
  },

  header:{
    marginBottom:25
  },

  heading:{
    fontSize:32,
    fontWeight:700,
    color:"#111827"
  },

  subHeading:{
    color:"#6b7280",
    marginTop:6
  },

  searchBox:{
    display:"flex",
    alignItems:"center",
    gap:10,
    background:"#fff",
    padding:"14px 18px",
    borderRadius:16,
    marginBottom:25,
    width:420,
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.05)"
  },

  searchInput:{
    border:"none",
    outline:"none",
    width:"100%",
    fontSize:14
  },

  tableContainer:{
    background:"#fff",
    borderRadius:24,
    overflowX:"auto",
    boxShadow:
      "0 6px 20px rgba(0,0,0,0.06)"
  },

  table:{
    width:"100%",
    borderCollapse:"collapse"
  },

  th:{
    textAlign:"left",
    padding:18,
    background:"#f9fafb",
    fontSize:13,
    color:"#374151",
    whiteSpace:"nowrap"
  },

  td:{
    padding:18,
    borderBottom:
      "1px solid #f1f5f9"
  },

  tdStrong:{
    padding:18,
    fontWeight:700,
    color:"#111827"
  },

  row:{
    transition:"0.2s"
  },

  select:{
    padding:"10px 12px",
    borderRadius:12,
    border:"1px solid #d1d5db",
    fontWeight:600
  },

  updateBtn:{
    background:"#2563eb",
    color:"#fff",
    border:"none",
    padding:"10px 18px",
    borderRadius:12,
    cursor:"pointer",
    fontWeight:700
  },

  deleteBtn:{
    background:"#dc2626",
    color:"#fff",
    border:"none",
    padding:"12px 18px",
    borderRadius:12,
    cursor:"pointer",
    fontWeight:700
  },

  viewBtn:{
    display:"flex",
    alignItems:"center",
    gap:6,
    background:"#111827",
    color:"#fff",
    border:"none",
    padding:"10px 18px",
    borderRadius:12,
    cursor:"pointer",
    fontWeight:600
  },

  overlay:{
    position:"fixed",
    inset:0,
    background:"rgba(0,0,0,0.6)",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    zIndex:999
  },

  modal:{
    width:"95%",
    maxWidth:1000,
    background:"#fff",
    borderRadius:30,
    padding:28,
    maxHeight:"92vh",
    overflowY:"auto"
  },

  modalHeader:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:24
  },

  modalTitle:{
    fontSize:30,
    fontWeight:700
  },

  modalSubTitle:{
    color:"#6b7280",
    marginTop:4
  },

  closeBtn:{
    width:44,
    height:44,
    borderRadius:"50%",
    border:"none",
    background:"#f3f4f6",
    cursor:"pointer"
  },

  sliderContainer:{
    position:"relative",
    marginBottom:24
  },

  modalImage:{
    width:"100%",
    height:430,
    objectFit:"cover",
    borderRadius:24
  },

  prevBtn:{
    position:"absolute",
    top:"50%",
    left:18,
    transform:"translateY(-50%)",
    width:48,
    height:48,
    borderRadius:"50%",
    border:"none",
    background:"#fff",
    cursor:"pointer"
  },

  nextBtn:{
    position:"absolute",
    top:"50%",
    right:18,
    transform:"translateY(-50%)",
    width:48,
    height:48,
    borderRadius:"50%",
    border:"none",
    background:"#fff",
    cursor:"pointer"
  },

  badgeRow:{
    display:"flex",
    gap:12,
    marginBottom:24
  },

  detailsGrid:{
    display:"grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap:18,
    marginBottom:24
  },

  infoCard:{
    background:"#f9fafb",
    padding:18,
    borderRadius:20,
    display:"flex",
    gap:14
  },

  infoIcon:{
    color:"#2563eb"
  },

  descriptionBox:{
    background:"#f9fafb",
    padding:24,
    borderRadius:22,
    marginBottom:24
  },

  mapContainer:{
    marginTop:20
  },

  mapFrame:{
    border:"none",
    borderRadius:22
  }
};

export default ComplaintsPage;