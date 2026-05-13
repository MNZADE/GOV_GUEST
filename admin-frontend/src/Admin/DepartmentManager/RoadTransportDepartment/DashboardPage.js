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
User,
Car,
FileWarning,
X,
CalendarDays
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
Normal:"#64748b"
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
priorityFilter,
setPriorityFilter
]=useState("All");

const[
selectedComplaint,
setSelectedComplaint
]=useState(null);

/* =====================================
FETCH COMPLAINTS
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

if(
!token||
!user
){

setLoading(false);

return;
}

/* =====================================
NORMALIZE DEPARTMENT
===================================== */

let department =
encodeURIComponent(

user.department
?.toLowerCase()
.trim()

);

/* =====================================
ROAD FIX
===================================== */

if(
department==="road"
){

department="road";
}

console.log(
"Department:",
department
);

/* =====================================
API URL
===================================== */

const apiUrl=
`http://localhost:5000/api/complaints/manager/${department}`;

console.log(
"API URL:",
apiUrl
);

/* =====================================
FETCH
===================================== */

const response=
await fetch(
apiUrl,
{
headers:{
Authorization:
`Bearer ${token}`
}
}
);

const data=
await response.json();

console.log(
"Backend Data:",
data
);

/* =====================================
SUCCESS
===================================== */

if(data.success){

const updatedComplaints=
(
data.complaints||
[]
).map((c)=>{

let priority=
"Normal";

const issueText=
`${c.issue} ${c.description}`.toLowerCase();

const createdHours=
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

/* ROAD URGENT */

if(

issueText.includes(
"pothole"
)||

issueText.includes(
"road accident"
)||

issueText.includes(
"bridge damage"
)||

issueText.includes(
"road collapse"
)||

issueText.includes(
"traffic signal"
)||

issueText.includes(
"road blockage"
)||

issueText.includes(
"waterlogged road"
)||

issueText.includes(
"highway crack"
)

){

priority=
"Urgent";
}

/* ESCALATION */

if(

createdHours>
48&&

c.status!==
"Resolved"

){

priority=
"Escalated";
}

return{

...c,

priority
};
});

setComplaints(
updatedComplaints
);

}else{

setComplaints([]);
}

}catch(err){

console.log(
"Fetch Error:",
err
);

}finally{

setLoading(false);
}
};

/* =====================================
FILTER
===================================== */

const filteredComplaints=
complaints.filter((c)=>{

const matchesSearch=

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
);

const matchesStatus=

statusFilter===
"All"||

c.status===
statusFilter;

const matchesPriority=

priorityFilter===
"All"||

c.priority===
priorityFilter;

return(

matchesSearch&&
matchesStatus&&
matchesPriority
);
});

/* =====================================
SLA
===================================== */

const getSLA=(
createdAt,
status
)=>{

const hours=
(
Date.now()-
new Date(createdAt)
)/
(
1000*
60*
60
);

if(
status===
"Resolved"
){

return{
label:
"Resolved",
color:
"#16a34a"
};
}

if(hours>48){

return{
label:
"Escalated",
color:
"#dc2626"
};
}

if(hours>24){

return{
label:
"Warning",
color:
"#f59e0b"
};
}

return{
label:
"Normal",
color:
"#2563eb"
};
};

/* =====================================
DATE
===================================== */

const formatDateTime=
(date)=>{

return new Date(
date
).toLocaleString(
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

return(

<div style={styles.container}>

{/* HEADER */}

<div style={styles.header}>

<div>

<h1 style={styles.title}>
Dashboard Monitoring Complaint
</h1>

<p style={styles.subtitle}>
Smart Road Complaint Monitoring
</p>

</div>

<div style={styles.headerIcon}>
<Car size={34}/>
</div>

</div>

{/* STATS */}

<div style={styles.statsGrid}>

<StatCard
icon={
<TrendingUp size={24}/>
}
title="Total Complaints"
value={
complaints.length
}
/>

<StatCard
icon={
<Clock size={24}/>
}
title="Pending"
value={
complaints.filter(
(c)=>
c.status===
"Pending"
).length
}
/>

<StatCard
icon={
<AlertTriangle size={24}/>
}
title="Escalated"
value={
complaints.filter(
(c)=>
c.priority===
"Escalated"
).length
}
/>

<StatCard
icon={
<CheckCircle size={24}/>
}
title="Resolved"
value={
complaints.filter(
(c)=>
c.status===
"Resolved"
).length
}
/>

</div>

{/* TABLE */}

<div style={styles.tableCard}>

<div style={styles.tableTop}>

<div>

<h2 style={styles.tableTitle}>
Road Complaints
</h2>

<p style={styles.tableSubtitle}>
Manage all road complaints
</p>

</div>

{/* FILTERS */}

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
All Status
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

<select
value={priorityFilter}
onChange={(e)=>
setPriorityFilter(
e.target.value
)
}
style={styles.select}
>

<option value="All">
All Priority
</option>

<option value="Urgent">
Urgent
</option>

<option value="Escalated">
Escalated
</option>

<option value="Normal">
Normal
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
Citizen
</th>

<th style={styles.th}>
Issue
</th>

<th style={styles.th}>
Location
</th>

<th style={styles.th}>
Status
</th>

<th style={styles.th}>
Priority
</th>

<th style={styles.th}>
SLA
</th>

<th style={styles.th}>
Date
</th>

<th style={styles.th}>
Action
</th>

</tr>

</thead>

<tbody>

{filteredComplaints.map((c)=>{

const sla=
getSLA(
c.createdAt,
c.status
);

return(

<tr
key={c._id}
style={styles.row}
>

<td style={styles.td}>
{c.complaintId}
</td>

<td style={styles.td}>

<div style={{
display:"flex",
alignItems:"center",
gap:8
}}>

<User size={15}/>

{c.name||
"Citizen"}

</div>

</td>

<td style={styles.td}>
{c.issue||
"Road Issue"}
</td>

<td style={styles.td}>

<div style={{
display:"flex",
alignItems:"center",
gap:6
}}>

<MapPin size={15}/>

{c.address||
"Unknown"}

</div>

</td>

<td style={styles.td}>
<Badge text={c.status}/>
</td>

<td style={styles.td}>
<Badge text={c.priority}/>
</td>

<td style={styles.td}>

<span style={{
background:
`${sla.color}20`,
color:
sla.color,
padding:
"7px 14px",
borderRadius:
30,
fontWeight:
700,
fontSize:12
}}>

{sla.label}

</span>

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
setSelectedComplaint(c)
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
{selectedComplaint.issue}
</h2>

<p style={styles.modalSubtitle}>
{selectedComplaint.complaintId}
</p>

</div>

<button
style={styles.closeBtn}
onClick={()=>
setSelectedComplaint(null)
}
>

<X size={18}/>

</button>

</div>

<div style={styles.modalGrid}>

<div style={styles.detailCard}>

<User size={18}/>

<div>

<h4>
Citizen
</h4>

<p>
{selectedComplaint.name}
</p>

</div>

</div>

<div style={styles.detailCard}>

<MapPin size={18}/>

<div>

<h4>
Location
</h4>

<p>
{selectedComplaint.address}
</p>

</div>

</div>

<div style={styles.detailCard}>

<FileWarning size={18}/>

<div>

<h4>
Status
</h4>

<p>
{selectedComplaint.status}
</p>

</div>

</div>

<div style={styles.detailCard}>

<CalendarDays size={18}/>

<div>

<h4>
Date
</h4>

<p>
{formatDateTime(
selectedComplaint.createdAt
)}
</p>

</div>

</div>

</div>

<div style={styles.descriptionBox}>

<h3>
Description
</h3>

<p>
{selectedComplaint.description}
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
height:"70vh",
fontSize:24,
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
fontSize:32,
fontWeight:800,
color:"#0f172a"
},

subtitle:{
marginTop:6,
color:"#64748b"
},

headerIcon:{
width:70,
height:70,
borderRadius:20,
background:"linear-gradient(135deg,#0f172a,#1e293b)",
color:"#38bdf8",
display:"flex",
alignItems:"center",
justifyContent:"center"
},

statsGrid:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",
gap:20,
marginBottom:25
},

statCard:{
background:"#fff",
borderRadius:20,
padding:22,
display:"flex",
alignItems:"center",
gap:16,
boxShadow:"0 10px 30px rgba(15,23,42,0.06)"
},

statIcon:{
width:60,
height:60,
borderRadius:18,
background:"linear-gradient(135deg,#0f172a,#334155)",
color:"#fff",
display:"flex",
alignItems:"center",
justifyContent:"center"
},

statLabel:{
margin:0,
color:"#64748b"
},

statValue:{
margin:"5px 0 0",
fontSize:28,
color:"#0f172a"
},

tableCard:{
background:"#fff",
borderRadius:28,
padding:25,
boxShadow:"0 10px 30px rgba(15,23,42,0.06)"
},

tableTop:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:20,
flexWrap:"wrap",
gap:20
},

tableTitle:{
margin:0,
fontSize:24,
color:"#0f172a",
fontWeight:700
},

tableSubtitle:{
marginTop:6,
color:"#64748b",
fontSize:14
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
background:"#f8fafc",
padding:"12px 16px",
borderRadius:14,
border:"1px solid #e2e8f0"
},

searchInput:{
border:"none",
outline:"none",
background:"transparent",
fontSize:14,
width:220
},

select:{
padding:"12px 16px",
borderRadius:14,
border:"1px solid #e2e8f0",
background:"#fff",
outline:"none",
fontSize:14,
cursor:"pointer"
},

tableWrapper:{
overflowX:"auto"
},

table:{
width:"100%",
borderCollapse:"collapse",
minWidth:"1200px"
},

tableHead:{
background:"#f8fafc"
},

th:{
textAlign:"left",
padding:18,
color:"#334155",
fontSize:13,
fontWeight:700,
borderBottom:"1px solid #e2e8f0"
},

td:{
padding:18,
borderBottom:"1px solid #f1f5f9",
color:"#0f172a",
fontSize:14
},

row:{
transition:"0.3s"
},

viewBtn:{
border:"none",
background:"linear-gradient(135deg,#0f172a,#1e293b)",
color:"#fff",
padding:"10px 18px",
borderRadius:12,
cursor:"pointer",
display:"flex",
alignItems:"center",
gap:8,
fontWeight:600
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
maxWidth:"900px",
background:"#fff",
borderRadius:30,
padding:30
},

modalTop:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:25
},

modalTitle:{
margin:0,
fontSize:28,
fontWeight:700
},

modalSubtitle:{
marginTop:6,
color:"#64748b"
},

closeBtn:{
width:45,
height:45,
border:"none",
borderRadius:12,
background:"#f1f5f9",
cursor:"pointer"
},

modalGrid:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:20,
marginBottom:25
},

detailCard:{
background:"#f8fafc",
padding:20,
borderRadius:18,
display:"flex",
alignItems:"center",
gap:15
},

descriptionBox:{
background:"#f8fafc",
padding:25,
borderRadius:20
}

};

export default DashboardPage;