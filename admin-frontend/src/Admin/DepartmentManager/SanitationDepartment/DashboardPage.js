import React, {
  useState,
  useEffect,
} from "react";

import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Flame,
  Search,
  Eye,
  X,
  Bell,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DashboardPage = ({
  departmentName =
    "Sanitation Department Dashboard",
}) => {

  /* ================= STATES ================= */

  const [
    complaintsData,
    setComplaintsData,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("All");

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [
    currentImage,
    setCurrentImage,
  ] = useState(0);

  /* ================= FETCH DATA ================= */

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

        const response =
          await fetch(

            "http://localhost:5000/api/complaints/manager/sanitation",

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
          "Dashboard Data:",
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

              address:
                c.address ||
                c.location ||
                "N/A",

              subCategory:

                Array.isArray(
                  c.subcategories
                )

                  ? c.subcategories.join(
                      ", "
                    )

                  : c.subcategories ||
                    "General",

              description:
                c.description ||
                "No description",

              status:
                c.status ||
                "Pending",

              priority:
                c.priority ||
                "Medium",

              type:
                c.issue ||
                "Complaint",

              date:
                new Date(
                  c.createdAt
                ).toLocaleDateString(),

              time:
                new Date(
                  c.createdAt
                ).toLocaleTimeString(),

              images:

                c.images &&
                c.images.length >
                  0

                  ? c.images.map(
                      (img) =>
                        `http://localhost:5000/uploads/${img}`
                    )

                  : [
                      "https://via.placeholder.com/700x400",
                    ],
            }));

          setComplaintsData(
            formatted
          );
        }

      } catch (err) {

        console.log(
          "Dashboard Error:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  /* ================= FILTER ================= */

  const filteredComplaints =
    complaintsData.filter(
      (complaint) => {

        const matchesSearch =

          complaint.id
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||

          complaint.address
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||

          complaint.subCategory
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            );

        const matchesStatus =

          selectedStatus ===
            "All" ||

          complaint.status ===
            selectedStatus;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  /* ================= STATS ================= */

  const stats = [

    {
      label: "Total",

      value:
        filteredComplaints.length,

      icon:
        <AlertTriangle size={20} />,

      color: "#2563eb",
    },

    {
      label: "Pending",

      value:
        filteredComplaints.filter(
          (c) =>
            c.status ===
            "Pending"
        ).length,

      icon:
        <Clock size={20} />,

      color: "#f59e0b",
    },

    {
      label: "Escalated",

      value:
        filteredComplaints.filter(
          (c) =>

            c.status ===
              "Escalated" ||

            c.priority ===
              "Critical"
        ).length,

      icon:
        <Flame size={20} />,

      color: "#ef4444",
    },

    {
      label: "Resolved",

      value:
        filteredComplaints.filter(
          (c) =>
            c.status ===
            "Resolved"
        ).length,

      icon:
        <CheckCircle size={20} />,

      color: "#22c55e",
    },
  ];

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div style={styles.loading}>
        Loading Dashboard...
      </div>
    );
  }

  return (

    <div style={styles.pageContainer}>

      {/* ================= TITLE ================= */}

      <h1 style={styles.mainTitle}>
        {departmentName}
      </h1>

      <p style={styles.subTitle}>
        Smart Complaint Monitoring Dashboard
      </p>

      {/* ================= ALERT ================= */}

      <div style={styles.notificationBar}>

        <Bell size={18} />

        {
          complaintsData.filter(
            (c) =>
              c.status ===
              "Resolved"
          ).length
        }

        {" "}
        complaints resolved today

      </div>

      {/* ================= KPI ================= */}

      <div style={styles.statsGrid}>

        {stats.map(
          (stat, i) => (

            <div
              key={i}
              style={{
                ...styles.statCard,
                borderLeft:
                  `5px solid ${stat.color}`,
              }}
            >

              <div>

                <p style={styles.statLabel}>
                  {stat.label}
                </p>

                <h2
                  style={{
                    ...styles.statValue,
                    color:
                      stat.color,
                  }}
                >
                  {stat.value}
                </h2>

              </div>

              <div
                style={{
                  color:
                    stat.color,
                }}
              >
                {stat.icon}
              </div>

            </div>
          )
        )}

      </div>

      {/* ================= SEARCH ================= */}

      <div style={styles.filterBar}>

        <Search
          size={15}
          style={styles.searchIcon}
        />

        <input
          type="text"

          placeholder="Search by ID, Address or SubCategory..."

          value={searchTerm}

          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }

          style={styles.searchInput}
        />

      </div>

      {/* ================= STATUS FILTER ================= */}

      <div style={styles.statusButtonBar}>

        {[
          "All",
          "Pending",
          "Escalated",
          "Resolved",
        ].map((status) => (

          <button
            key={status}

            onClick={() =>
              setSelectedStatus(
                status
              )
            }

            style={{
              ...styles.statusButton,

              background:

                selectedStatus ===
                status

                  ? "#2563eb"

                  : "#e5e7eb",

              color:

                selectedStatus ===
                status

                  ? "#fff"

                  : "#374151",
            }}
          >
            {status}
          </button>
        ))}

      </div>

      {/* ================= TABLE ================= */}

      <div style={styles.tableContainer}>

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>
                Complaint ID
              </th>

              <th style={styles.th}>
                Address
              </th>

              <th style={styles.th}>
                SubCategory
              </th>

              <th style={styles.th}>
                Date
              </th>

              <th style={styles.th}>
                Time
              </th>

              <th style={styles.th}>
                Priority
              </th>

              <th style={styles.th}>
                Status
              </th>

              <th style={styles.th}>
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredComplaints.map(
              (complaint) => (

                <tr
                  key={complaint.id}
                >

                  <td
                    style={
                      styles.tdStrong
                    }
                  >
                    {complaint.id}
                  </td>

                  <td style={styles.td}>
                    {
                      complaint.address
                    }
                  </td>

                  <td style={styles.td}>
                    {
                      complaint.subCategory
                    }
                  </td>

                  <td style={styles.td}>
                    {complaint.date}
                  </td>

                  <td style={styles.td}>
                    {complaint.time}
                  </td>

                  <td style={styles.td}>

                    <PriorityBadge
                      priority={
                        complaint.priority
                      }
                    />

                  </td>

                  <td style={styles.td}>

                    <StatusBadge
                      status={
                        complaint.status
                      }
                    />

                  </td>

                  <td style={styles.td}>

                    <button
                      style={
                        styles.viewButton
                      }

                      onClick={() => {

                        setSelectedComplaint(
                          complaint
                        );

                        setCurrentImage(
                          0
                        );
                      }}
                    >

                      <Eye size={14} />

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

        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div
              style={
                styles.modalHeader
              }
            >

              <div>

                <h2
                  style={
                    styles.modalTitle
                  }
                >
                  Complaint Details
                </h2>

                <p
                  style={
                    styles.modalSubTitle
                  }
                >
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

            <div
              style={
                styles.sliderContainer
              }
            >

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

                  <ChevronLeft size={24} />

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

                  <ChevronRight size={24} />

                </button>
              )}

              <div
                style={
                  styles.imageCounter
                }
              >

                {currentImage + 1}

                {" / "}

                {
                  selectedComplaint
                    .images.length
                }

              </div>

            </div>

            {/* BADGES */}

            <div
              style={
                styles.topBadgeRow
              }
            >

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

            <div
              style={
                styles.detailsGrid
              }
            >

              <DetailCard
                icon={<MapPin />}
                title="Address"
                value={
                  selectedComplaint.address
                }
              />

              <DetailCard
                icon={<Calendar />}
                title="Date"
                value={
                  selectedComplaint.date
                }
              />

              <DetailCard
                icon={<Clock />}
                title="Time"
                value={
                  selectedComplaint.time
                }
              />

              <DetailCard
                icon={<AlertTriangle />}
                title="SubCategory"
                value={
                  selectedComplaint.subCategory
                }
              />

            </div>

            {/* DESCRIPTION */}

            <div
              style={
                styles.descriptionBox
              }
            >

              <h3
                style={
                  styles.sectionTitle
                }
              >
                Complaint Description
              </h3>

              <p
                style={
                  styles.descriptionText
                }
              >

                {
                  selectedComplaint.description
                }

              </p>

            </div>

            {/* MAP */}

            <div
              style={
                styles.mapContainer
              }
            >

              <h3
                style={
                  styles.sectionTitle
                }
              >
                Geo Tag Location
              </h3>

              <iframe
                title="Complaint Map"

                width="100%"

                height="320"

                loading="lazy"

                allowFullScreen

                style={
                  styles.mapFrame
                }

                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  selectedComplaint.address
                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              />

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/* ================= BADGES ================= */

const PriorityBadge = ({
  priority,
}) => {

  const stylesMap = {

    Low: {
      bg: "#dcfce7",
      text: "#166534",
    },

    Medium: {
      bg: "#fef3c7",
      text: "#92400e",
    },

    High: {
      bg: "#fee2e2",
      text: "#b91c1c",
    },

    Critical: {
      bg: "#7f1d1d",
      text: "#ffffff",
    },
  };

  const style =
    stylesMap[priority] ||
    stylesMap["Medium"];

  return (

    <span style={{
      padding:"6px 14px",
      borderRadius:20,
      fontSize:12,
      fontWeight:700,
      background:style.bg,
      color:style.text
    }}>
      {priority}
    </span>
  );
};

const StatusBadge = ({
  status,
}) => {

  const stylesMap = {

    Pending: {
      bg:"#fef3c7",
      text:"#92400e",
    },

    Escalated: {
      bg:"#fee2e2",
      text:"#b91c1c",
    },

    Resolved: {
      bg:"#dcfce7",
      text:"#166534",
    },
  };

  const style =
    stylesMap[status] ||
    stylesMap["Pending"];

  return (

    <span style={{
      padding:"6px 14px",
      borderRadius:20,
      fontSize:12,
      fontWeight:700,
      background:style.bg,
      color:style.text
    }}>
      {status}
    </span>
  );
};

const DetailCard = ({
  icon,
  title,
  value,
}) => (

  <div style={styles.detailCard}>

    <div style={styles.detailIcon}>
      {icon}
    </div>

    <div>

      <small>
        {title}
      </small>

      <p>
        {value}
      </p>

    </div>

  </div>
);

/* ================= STYLES ================= */

const styles = {

  pageContainer:{
    padding:35,
    background:"#f3f4f6",
    minHeight:"100vh"
  },

  loading:{
    padding:40,
    textAlign:"center",
    fontSize:20
  },

  mainTitle:{
    fontSize:30,
    fontWeight:700
  },

  subTitle:{
    color:"#6b7280",
    marginBottom:20
  },

  notificationBar:{
    display:"flex",
    alignItems:"center",
    gap:10,
    background:"#e0f2fe",
    padding:"14px 18px",
    borderRadius:14,
    marginBottom:25
  },

  statsGrid:{
    display:"grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap:20,
    marginBottom:25
  },

  statCard:{
    background:"#fff",
    padding:22,
    borderRadius:18,
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center"
  },

  statLabel:{
    color:"#6b7280"
  },

  statValue:{
    fontSize:32,
    fontWeight:700
  },

  filterBar:{
    position:"relative",
    width:350,
    marginBottom:20
  },

  searchIcon:{
    position:"absolute",
    left:12,
    top:12
  },

  searchInput:{
    width:"100%",
    padding:"12px 12px 12px 38px",
    borderRadius:12,
    border:"1px solid #d1d5db"
  },

  statusButtonBar:{
    display:"flex",
    gap:10,
    marginBottom:25
  },

  statusButton:{
    padding:"8px 16px",
    borderRadius:20,
    border:"none",
    cursor:"pointer",
    fontWeight:600
  },

  tableContainer:{
    background:"#fff",
    padding:25,
    borderRadius:20,
    overflowX:"auto"
  },

  table:{
    width:"100%",
    borderCollapse:"collapse"
  },

  th:{
    textAlign:"left",
    padding:14,
    background:"#f9fafb"
  },

  td:{
    padding:14,
    borderBottom:
      "1px solid #f1f5f9"
  },

  tdStrong:{
    padding:14,
    fontWeight:700
  },

  viewButton:{
    display:"flex",
    alignItems:"center",
    gap:6,
    background:"#2563eb",
    color:"#fff",
    border:"none",
    padding:"8px 14px",
    borderRadius:10,
    cursor:"pointer"
  },

  overlay:{
    position:"fixed",
    inset:0,
    background:"rgba(0,0,0,0.5)",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    zIndex:999
  },

  modal:{
    width:"95%",
    maxWidth:1000,
    background:"#ffffff",
    borderRadius:28,
    padding:28,
    maxHeight:"92vh",
    overflowY:"auto"
  },

  modalHeader:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:22
  },

  modalTitle:{
    fontSize:30,
    fontWeight:700
  },

  modalSubTitle:{
    color:"#6b7280"
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
    marginBottom:26
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

  imageCounter:{
    position:"absolute",
    top:18,
    right:18,
    background:"rgba(0,0,0,0.65)",
    color:"#fff",
    padding:"6px 14px",
    borderRadius:20
  },

  topBadgeRow:{
    display:"flex",
    gap:14,
    marginBottom:24
  },

  detailsGrid:{
    display:"grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap:18,
    marginBottom:24
  },

  detailCard:{
    background:"#f9fafb",
    padding:18,
    borderRadius:18,
    display:"flex",
    gap:14
  },

  detailIcon:{
    color:"#2563eb"
  },

  descriptionBox:{
    background:"#f9fafb",
    padding:24,
    borderRadius:22,
    marginBottom:24
  },

  sectionTitle:{
    fontSize:19,
    fontWeight:700,
    marginBottom:14
  },

  descriptionText:{
    lineHeight:1.8
  },

  mapContainer:{
    marginTop:10
  },

  mapFrame:{
    border:"none",
    borderRadius:22
  }
};

export default DashboardPage;