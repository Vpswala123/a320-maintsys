class MaintenancePlanner {
    constructor() {
        this.checks = [
            { check: "A1", interval_hours: 500 },
            { check: "A2", interval_hours: 1000 },
            { check: "C1", interval_hours: 6000 },
            { check: "C2", interval_hours: 12000 }
        ];
    }

    /**
     * Simulate basic wear and tear on a component
     */
    updateComponentHealth(component) {
        component.health -= (Math.random() * 0.5);

        if (component.health < 85) {
            component.status = "maintenance_due";
        }
        
        if (component.health < 70) {
            component.status = "fault";
        }

        return component;
    }

    /**
     * Checks if a specific component requires maintenance based on flight hours
     */
    checkMaintenance(component) {
        if (component.cycle_hours >= component.maintenance_interval_hours) {
            return "maintenance_due";
        }
        return "ok";
    }

    /**
     * Calculates time until next major check
     */
    calculateNextCheck(currentAircraftHours) {
        let nextCheck = this.checks.find(c => currentAircraftHours % c.interval_hours > (c.interval_hours - 100)); // Within 100 hours
        return nextCheck || null;
    }
}

// Export for frontend use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = new MaintenancePlanner();
} else {
    window.MaintenancePlanner = new MaintenancePlanner();
}
