document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('dashboard-container');

    try {
        // Assume API runs on localhost:3000 for local dev
        // This will attempt to fetch data from our new dashboard route
        const response = await fetch('http://localhost:3000/api/dashboard', {
            headers: {
                'Content-Type': 'application/json'
                // Typically you would add Authorization: Bearer token right here
            }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        // Render digital twin dashboard layout
        container.innerHTML = `
            <h3>----------------------------------</h3>
            <h2>Aircraft Health: ${data.aircraft_health}%</h2>
            <p>Active Alerts: ${data.alerts}</p>
            <p style="color: yellow;">Next Maintenance: <br/>${data.next_check}</p>
            
            <hr style="border-color:#444;" />
            <h4>System Health:</h4>
            ${Object.entries(data.systems_status).map(([sys, health]) => {
                return `<p>${sys}: ${health}%</p>`;
            }).join('')}
            
            <hr style="border-color:#444;" />
            <h4>Maintenance Due:</h4>
            <ul style="color: #f87171;">
                ${data.maintenance_due.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <h3>----------------------------------</h3>
        `;
    } catch (err) {
        console.error("Dashboard failed to load", err);
        container.innerHTML = `
            <p style="color: red;">Failed to load aircraft telemetry.</p>
            <p>Error: ${err.message}</p>
            <p>Ensure the backend is running on port 3000.</p>
        `;
    }
});
