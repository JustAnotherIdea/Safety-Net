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
        <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Opening Hours</h3>
            {periods.length > 0 ? (
                <ul className="space-y-2">
                    {periods.map((period, index) => (
                        <li key={index} className="flex justify-between text-gray-700">
                            <span className="font-medium">{getDayName(period.open.day)}</span>
                            <span>
                                {convertTimeTo12Hour(period.open.time)} - {convertTimeTo12Hour(period.close.time)}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600">No opening hours available.</p>
            )}
        </div>
    );
}

export default OpeningHoursDisplay;
