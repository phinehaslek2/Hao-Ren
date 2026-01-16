// --- NAVIGATION HIGHLIGHTING ---
// Ensures the navigation bar shows which page the user is currently on
const currentPath = window.location.pathname.split('/').pop() || 'Home.html';
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

const ID_LOCATION = "rb0da2a4123b549fcaa292cd90856f770"; 
const ID_SLOTS = "r745a7fd2cb0741d59668daa386d5f7fa";

const IND_FORM = "https://forms.office.com/Pages/ResponsePage.aspx?id=8JupJXKOKkeuUK373w328dh9UJp6q6xJrKZal-VdyipUMDQxVFJSVFhXSTJTVlZQNFVNREhBMUhHQi4u";
const ORG_FORM = "https://forms.office.com/Pages/ResponsePage.aspx?id=8JupJXKOKkeuUK373w328dh9UJp6q6xJrKZal-VdyipUMloyVDdWMUg5V1hBTk8xWFBYUTFINzBZMC4u";

// Note: The 'address' field must match your Form's dropdown options EXACTLY for auto-fill to work.
const locations = {
    1: { 
        name: 'Jurong West', 
        address: 'Jurong West', 
        coords: [103.7000, 1.3500],
        sessions: [
            { date: 'Saturday, Jan 17, 2026', time: '8.00 AM - 11.00 AM', current: 11, total: 35 },
            { date: 'Saturday, Jan 3, 2026', time: '2.00 PM - 5.00 PM', current: 9, total: 35 }
        ]
    },
    2: { 
        name: 'Bukit Timah', 
        address: 'Bukit Timah', 
        coords: [103.8100, 1.3300],
        sessions: [
            { date: 'Saturday, Jan 3, 2026', time: '2.00 PM - 5.00 PM', current: 25, total: 35 }
        ]
    },
    3: { 
        name: 'Tampines', 
        address: 'Tampines', 
        coords: [103.9500, 1.3550],
        sessions: [
            { date: 'Saturday, Jan 31, 2026', time: '5.00 PM - 8.00 PM', current: 35, total: 35 }
        ]
    }
};

const placeholder = document.getElementById('placeholder');
const contentArea = document.getElementById('details-content');
const modal = document.getElementById('choice-modal');

// Determines color based on availability percentage
function getColor(current, total) {
    const ratio = current / total;
    if (ratio >= 1) return '#ff0000'; // Full (Red)
    if (ratio > 0.7) return '#ffcc00'; // Limited (Yellow)
    return '#00ff40'; // Available (Green)
}

// --- D3 MAP RENDERING ---
async function renderMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    const width = mapContainer.clientWidth;
    const height = mapContainer.clientHeight;
    
    // Clear existing map elements before redraw
    d3.select("#map-container svg").remove();
    d3.selectAll(".pin").remove();

    const svg = d3.select("#map-container").insert("svg", ":first-child")
        .attr("class", "map-svg")
        .attr("viewBox", `0 0 ${width} ${height}`);

    try {
        const geoData = await d3.json("./singapore-boundary.geojson");
        const projection = d3.geoMercator().fitSize([width, height], geoData);
        const pathGenerator = d3.geoPath().projection(projection);

        svg.selectAll("path")
            .data(geoData.features ? geoData.features : [geoData])
            .join("path")
            .attr("d", pathGenerator)
            .attr("class", "map-path");

        Object.keys(locations).forEach(id => {
            const loc = locations[id];
            const [x, y] = projection(loc.coords);
            
            // Set pin color based on the first session's status
            const statusColor = getColor(loc.sessions[0].current, loc.sessions[0].total);
            
            const pin = document.createElement('div');
            pin.className = 'pin';
            pin.style.left = `${x}px`; 
            pin.style.top = `${y}px`; 
            pin.style.color = statusColor;
            pin.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
            
            pin.addEventListener('click', () => showDetails(id));
            mapContainer.appendChild(pin);
        });
    } catch (e) { 
        console.error("Map Data Load Error: Make sure singapore-boundary.geojson is in the folder.", e); 
    }
}

// Displays location-specific sessions in the sidebar
function showDetails(id) {
    const loc = locations[id];
    placeholder.style.display = 'none';
    contentArea.style.display = 'flex';

    let cardsHtml = '';
    let anyAvailable = false;

    loc.sessions.forEach(session => {
        const slotsLeft = session.total - session.current;
        const percent = (session.current / session.total) * 100;
        const sessionColor = getColor(session.current, session.total);
        const slotValue = `${session.date} (${session.time})`;

        if (slotsLeft > 0) anyAvailable = true;

        cardsHtml += `
        <div class="event-card">
            <div class="info-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span class="info-text">${session.date}</span></div>
            <div class="info-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span class="info-text">${session.time}</span></div>
            <div class="info-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg><span class="info-text">${session.current} / ${session.total} (${slotsLeft} slots left)</span></div>
            <div class="progress-container"><div class="progress-bar" style="width: ${percent}%; background-color: ${sessionColor}"></div></div>
            ${slotsLeft > 0 ? `<button class="slot-signup-btn" onclick="openChoiceModal('${id}', '${slotValue}')">Sign Up</button>` : ''}
        </div>`;
    });

    contentArea.innerHTML = `
        <div class="location-header"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>${loc.name}</div>
        <div class="cards-list">${cardsHtml}</div>
        ${anyAvailable ? '' : '<div class="full-msg" style="text-align:center; font-weight:700; color:#ff0000; margin-top:20px;">All slots are full. Please select another location.</div>'}`;
}

function openChoiceModal(locId, slotValue) {
    modal.style.display = 'flex';
    const loc = locations[locId];
    
    // Microsoft Forms prefers '+' for spaces in dropdowns
    const locationData = loc.address.replace(/ /g, "+");
    const slotData = encodeURIComponent(slotValue);

    document.getElementById('btn-individual').onclick = () => {
        // Constructing the URL using the ID found in your HTML snippet
        const url = `${IND_FORM}&${ID_LOCATION}=${locationData}&${ID_SLOTS}=${slotData}`;
        
        console.log("Testing URL: ", url); // Check this in your F12 Console if it fails!
        window.open(url, '_blank');
        closeModal();
    };

    document.getElementById('btn-org').onclick = () => {
        const url = `${ORG_FORM}&${ID_LOCATION}=${locationData}&${ID_SLOTS}=${slotData}`;
        window.open(url, '_blank');
        closeModal();
    };
}

function closeModal() { if(modal) modal.style.display = 'none'; }

// Initialize Map
window.addEventListener('load', renderMap);
window.addEventListener('resize', renderMap);