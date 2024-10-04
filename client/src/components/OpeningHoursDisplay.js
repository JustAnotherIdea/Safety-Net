import React from 'react';

function OpeningHoursDisplay({ periods }) {
    const convertTimeTo12Hour = (time) => {
        // Convert 'HHMM' format to 'HH:MM AM/PM' format
        const hours = parseInt(time.substring(0, 2), 10);
        const minutes = time.substring(2, 4);
        const period = hours >= 12 ? 'PM' : 'AM';
        const adjustedHours = hours % 12 || 12; // Convert to 12-hour format
        return `${adjustedHours}:${minutes} ${period}`;
    };

    const getDayName = (day) => {
        // Map day numbers to names
        const dayNames = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];
        return dayNames[day] || 'Invalid Day';
    };

    return (
        <div>
            <h3>Opening Hours</h3>
            {periods.length > 0 ? (
                <ul>
                    {periods.map((period, index) => (
                        <li key={index}>
                            {getDayName(period.open.day)}: {convertTimeTo12Hour(period.open.time)} to {convertTimeTo12Hour(period.close.time)} 
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No opening hours available.</p>
            )}
        </div>
    );
}

export default OpeningHoursDisplay;
