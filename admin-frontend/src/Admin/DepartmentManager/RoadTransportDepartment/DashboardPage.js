import React,{
useState,
useEffect
}from "react";

import{
AlertTriangle,
CheckCircle,
Clock,
TrendingUp,
Search,
Eye,
MapPin,
Car,
FileWarning,
X,
CalendarDays,
Building2
}from "lucide-react";

/* =====================================
STATUS BADGE
===================================== */

const Badge=({text})=>{

const colors={

Pending:"#eab308",

Resolved:"#22c55e",

"In Progress":"#3b82f6",

Escalated:"#ef4444",

Urgent:"#dc2626",

High:"#ea580c",

Medium:"#2563eb",

Normal:"#64748b",

Warning:"#f59e0b"
};

const color=
colors[text]||
"#64748b";

return(

<span style={{
background:`${color}15`,
color,
padding:"8px 14px",
borderRadius:30,
fontSize:12,
fontWeight:700,
border:`1px solid ${color}25`
}}>

{text}

</span>
);
};

/* =====================================
STAT CARD
===================================== */

const StatCard=({
icon,
title,
value
})=>(

<div style={styles.statCard}>

<div style={styles.statIcon}>
{icon}
</div>

<div>

<p style={styles.statLabel}>
{title}
</p>

<h2 style={styles.statValue}>
{value}
</h2>

</div>

</div>
);

/* =====================================
MAIN
===================================== */

const DashboardPage=()=>{

const[
complaints,
setComplaints
]=useState([]);

const[
loading,
setLoading
]=useState(true);

const[
search,
setSearch
]=useState("");

const[
statusFilter,
setStatusFilter
]=useState("All");

const[
selectedComplaint,
setSelectedComplaint
]=useState(null);

/* =====================================
FETCH
===================================== */

useEffect(()=>{

fetchComplaints();

},[]);

const fetchComplaints=
async()=>{

try{

setLoading(true);

const token=
localStorage.getItem(
"kmc_token"
);

const user=
JSON.parse(
localStorage.getItem(
"kmc_user"
)
);

const deptMap={

"Health Department":
"health",

"Sanitation Department":
"sanitation",

"Water Supply Department":
"water",

"Electricity Department":
"streetlight",

"Road & Transportation Department":
"roads",

"Drainage & Sewage Department":
"drainage",

"General Complaint Department":
"other",
};

const department=

deptMap[
user?.department
]||

"other";

const response=
await fetch(

`http://localhost:5000/api/complaints/manager/${department}`,

{
headers:{
Authorization:
`Bearer ${token}`
}
}
);

const data=
await response.json();

if(data.success){

setComplaints(
data.complaints||[]
);

}else{

setComplaints([]);
}

}catch(err){

console.log(err);

}finally{

setLoading(false);
}
};

/* =====================================
FILTER
===================================== */

const filteredComplaints=
complaints.filter((c)=>{

return(

(
c.issue||""
)

.toLowerCase()

.includes(
search.toLowerCase()
)

||

(
c.complaintId||""
)

.toLowerCase()

.includes(
search.toLowerCase()
)

)

&&

(
statusFilter==="All"||

c.status===statusFilter
);
});

/* =====================================
DATE FORMAT
===================================== */

const formatDateTime=
(date)=>{

return new Date(date)
.toLocaleString(
"en-IN",
{
day:"2-digit",
month:"short",
year:"numeric",
hour:"2-digit",
minute:"2-digit"
}
);
};

/* =====================================
LOADING
===================================== */

if(loading){

return(

<div style={styles.loader}>
Loading Dashboard...
</div>
);
}

/* =====================================
UI
===================================== */

return(

<div style={styles.container}>

{/* HEADER */}

<div style={styles.header}>

<div>

<h1 style={styles.title}>
Department Complaint Dashboard
</h1>

<p style={styles.subtitle}>
Modern Complaint Monitoring System
</p>

</div>

<div style={styles.headerIcon}>
<Car size={34}/>
</div>

</div>

{/* STATS */}

<div style={styles.statsGrid}>

<StatCard
icon={<TrendingUp size={24}/>}
title="Total"
value={complaints.length}
/>

<StatCard
icon={<Clock size={24}/>}
title="Pending"
value={
complaints.filter(
(c)=>
c.status==="Pending"
).length
}
/>

<StatCard
icon={<CheckCircle size={24}/>}
title="Resolved"
value={
complaints.filter(
(c)=>
c.status==="Resolved"
).length
}
/>

<StatCard
icon={<AlertTriangle size={24}/>}
title="In Progress"
value={
complaints.filter(
(c)=>
c.status==="In Progress"
).length
}
/>

</div>

{/* TABLE */}

<div style={styles.tableCard}>

<div style={styles.topBar}>

<div>

<h2 style={styles.tableTitle}>
Complaints
</h2>

<p style={styles.tableSubtitle}>
Manage department complaints
</p>

</div>

<div style={styles.filterRow}>

<div style={styles.searchBox}>

<Search
size={18}
color="#64748b"
/>

<input
type="text"
placeholder="Search complaint..."
value={search}
onChange={(e)=>
setSearch(
e.target.value
)
}
style={styles.searchInput}
/>

</div>

<select
value={statusFilter}
onChange={(e)=>
setStatusFilter(
e.target.value
)
}
style={styles.select}
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

</select>

</div>

</div>

{/* TABLE */}

<div style={styles.tableWrapper}>

<table style={styles.table}>

<thead>

<tr style={styles.tableHead}>

<th style={styles.th}>
Complaint ID
</th>

<th style={styles.th}>
Issue
</th>

<th style={styles.th}>
Priority
</th>

<th style={styles.th}>
Status
</th>

<th style={styles.th}>
SLA
</th>

<th style={styles.th}>
Date & Time
</th>

<th style={styles.th}>
Action
</th>

</tr>

</thead>

<tbody>

{filteredComplaints.map((c)=>{

/* PRIORITY */

let priority="Normal";

const issueText=

`${c.issue} ${c.description}`

.toLowerCase();

if(

issueText.includes("fire")||

issueText.includes("accident")||

issueText.includes("collapse")||

issueText.includes("overflow")||

issueText.includes("electric shock")||

issueText.includes("large pothole")

){

priority="Urgent";
}

else if(

issueText.includes("garbage")||

issueText.includes("street light")||

issueText.includes("drainage")||

issueText.includes("traffic")

){

priority="High";
}

else if(

issueText.includes("repair")||

issueText.includes("maintenance")

){

priority="Medium";
}

/* SLA */

const hours=

(
Date.now()-

new Date(
c.createdAt
)

)/

(
1000*
60*
60
);

let sla="Normal";

if(
hours>48&&
c.status!=="Resolved"
){

sla="Escalated";

}else if(
hours>24&&
c.status!=="Resolved"
){

sla="Warning";
}

return(

<tr
key={c._id}
style={styles.row}
>

<td style={styles.td}>
{c.complaintId}
</td>

<td style={styles.td}>
{c.issue}
</td>

<td style={styles.td}>
<Badge text={priority}/>
</td>

<td style={styles.td}>
<Badge text={c.status}/>
</td>

<td style={styles.td}>
<Badge text={sla}/>
</td>

<td style={styles.td}>
{formatDateTime(
c.createdAt
)}
</td>

<td style={styles.td}>

<button
style={styles.viewBtn}
onClick={()=>
setSelectedComplaint({
...c,
priority
})
}
>

<Eye size={16}/>

View

</button>

</td>

</tr>
);
})}

</tbody>

</table>

</div>

</div>

{/* MODAL */}

{selectedComplaint&&(

<div style={styles.overlay}>

<div style={styles.modal}>

<div style={styles.modalTop}>

<div>

<h2 style={styles.modalTitle}>
Complaint Details
</h2>

<p style={styles.modalSub}>
{
selectedComplaint.complaintId
}
</p>

</div>

<button
style={styles.closeBtn}
onClick={()=>
setSelectedComplaint(null)
}
>

<X size={20}/>

</button>

</div>

{/* BADGES */}

<div style={{
display:"flex",
gap:12,
marginBottom:25,
flexWrap:"wrap"
}}>

<Badge
text={
selectedComplaint.status
}
/>

<Badge
text={
selectedComplaint.priority
}
/>

</div>

{/* IMAGE SLIDER */}

{selectedComplaint.images&&
selectedComplaint.images.length>0&&(

<div style={styles.imageSection}>

<h3 style={styles.sectionTitle}>
Complaint Images
</h3>

<div style={styles.imageSlider}>

{selectedComplaint.images.map(
(img,index)=>(

<img
key={index}
src={img}
alt="complaint"
style={styles.complaintImage}
/>
)
)}

</div>

</div>
)}

{/* DETAILS */}

<div style={styles.detailsGrid}>

<div style={styles.detailCard}>

<MapPin size={18}/>

<div>

<h4>
Address
</h4>

<p>
{
selectedComplaint.address||
"N/A"
}
</p>

</div>

</div>

<div style={styles.detailCard}>

<Building2 size={18}/>

<div>

<h4>
Department
</h4>

<p>
{
selectedComplaint.department||
"N/A"
}
</p>

</div>

</div>

<div style={styles.detailCard}>

<FileWarning size={18}/>

<div>

<h4>
Issue
</h4>

<p>
{
selectedComplaint.issue||
"N/A"
}
</p>

</div>

</div>

<div style={styles.detailCard}>

<CalendarDays size={18}/>

<div>

<h4>
Created Date
</h4>

<p>
{
formatDateTime(
selectedComplaint.createdAt
)
}
</p>

</div>

</div>

</div>

{/* DESCRIPTION */}

<div style={styles.descriptionBox}>

<h3>
Complaint Description
</h3>

<p>
{
selectedComplaint.description||
"No Description"
}
</p>

</div>

</div>

</div>
)}

</div>
);
};

/* =====================================
STYLES
===================================== */

const styles={

container:{
padding:25,
background:"#f1f5f9",
minHeight:"100vh"
},

loader:{
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"100vh",
fontSize:26,
fontWeight:700
},

header:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:25
},

title:{
margin:0,
fontSize:34,
fontWeight:800,
color:"#0f172a"
},

subtitle:{
marginTop:6,
color:"#64748b"
},

headerIcon:{
width:75,
height:75,
borderRadius:22,
background:"linear-gradient(135deg,#0f172a,#1e293b)",
display:"flex",
justifyContent:"center",
alignItems:"center",
color:"#38bdf8"
},

statsGrid:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",
gap:20,
marginBottom:25
},

statCard:{
background:"#fff",
padding:24,
borderRadius:24,
display:"flex",
gap:18,
alignItems:"center",
boxShadow:"0 10px 30px rgba(0,0,0,0.05)"
},

statIcon:{
width:60,
height:60,
borderRadius:18,
background:"#0f172a",
color:"#fff",
display:"flex",
justifyContent:"center",
alignItems:"center"
},

statLabel:{
margin:0,
color:"#64748b"
},

statValue:{
marginTop:6,
fontSize:28,
fontWeight:800
},

tableCard:{
background:"#fff",
borderRadius:28,
padding:25,
boxShadow:"0 10px 30px rgba(0,0,0,0.05)"
},

topBar:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:20,
flexWrap:"wrap",
gap:20
},

tableTitle:{
margin:0,
fontSize:26,
fontWeight:800
},

tableSubtitle:{
marginTop:6,
color:"#64748b"
},

filterRow:{
display:"flex",
gap:12,
flexWrap:"wrap"
},

searchBox:{
display:"flex",
alignItems:"center",
gap:10,
padding:"12px 16px",
border:"1px solid #e2e8f0",
borderRadius:14,
background:"#f8fafc"
},

searchInput:{
border:"none",
outline:"none",
background:"transparent",
width:220
},

select:{
padding:"12px 16px",
borderRadius:14,
border:"1px solid #e2e8f0",
background:"#fff"
},

tableWrapper:{
overflowX:"auto"
},

table:{
width:"100%",
borderCollapse:"collapse"
},

tableHead:{
background:"#f8fafc"
},

th:{
padding:18,
textAlign:"left",
fontSize:13,
color:"#334155"
},

td:{
padding:18,
borderBottom:"1px solid #f1f5f9"
},

row:{
transition:"0.3s"
},

viewBtn:{
border:"none",
padding:"10px 18px",
borderRadius:14,
background:"linear-gradient(135deg,#0f172a,#1e293b)",
color:"#fff",
cursor:"pointer",
display:"flex",
alignItems:"center",
gap:8,
fontWeight:700
},

overlay:{
position:"fixed",
inset:0,
background:"rgba(0,0,0,0.55)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:9999
},

modal:{
width:"95%",
maxWidth:"1000px",
background:"#fff",
borderRadius:30,
padding:30,
maxHeight:"90vh",
overflowY:"auto"
},

modalTop:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:25
},

modalTitle:{
margin:0,
fontSize:30,
fontWeight:800
},

modalSub:{
marginTop:5,
color:"#64748b"
},

closeBtn:{
width:45,
height:45,
border:"none",
borderRadius:14,
background:"#f1f5f9",
cursor:"pointer"
},

detailsGrid:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:20,
marginBottom:25
},

detailCard:{
background:"#f8fafc",
padding:22,
borderRadius:18,
display:"flex",
gap:14,
alignItems:"center"
},

descriptionBox:{
background:"#f8fafc",
padding:24,
borderRadius:20,
marginBottom:20
},

imageSection:{
marginBottom:25
},

sectionTitle:{
fontSize:22,
fontWeight:700,
marginBottom:18,
color:"#0f172a"
},

imageSlider:{
display:"flex",
gap:18,
overflowX:"auto",
paddingBottom:10
},

complaintImage:{
width:280,
height:200,
objectFit:"cover",
borderRadius:22,
boxShadow:"0 10px 25px rgba(0,0,0,0.12)",
border:"3px solid #fff"
}

};

export default DashboardPage;