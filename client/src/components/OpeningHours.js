import React, { useState, useEffect } from 'react';

function OpeningHours({ periods, setPeriods }) {
    // Ensure periods defaults to an empty array if not provided
    const [openingPeriods, setOpeningPeriods] = useState(periods || []);

    // Effect to update periods if initialHours changes
    useEffect(() => {
        setOpeningPeriods(periods || []); // Ensure it resets correctly when inputs change
    }, [periods]);

    const convertTime = (time) => {
        // Convert 'HHMM' format to 'HH:MM' format
        return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
    };

    const formatTime = (time) => {
        // Convert 'HH:MM' format back to 'HHMM'
        return time.replace(':', '');
    };

    const handleChange = (index, field, value) => {
        const updatedPeriods = [...openingPeriods];
        updatedPeriods[index] = {
            ...updatedPeriods[index],
            [field]: value,
        };
        setOpeningPeriods(updatedPeriods); // Update local state
        setPeriods(updatedPeriods); // Update parent state
    };

    const handleAddPeriod = () => {
        const newPeriod = { open: { day: 0, time: '0800' }, close: { day: 0, time: '1600' } };
        setOpeningPeriods([...openingPeriods, newPeriod]); // Add a new period
        setPeriods([...openingPeriods, newPeriod]); // Reflect this change in the parent
    };

    const handleRemovePeriod = (index) => {
        const updatedPeriods = openingPeriods.filter((_, i) => i !== index);
        setOpeningPeriods(updatedPeriods); // Remove the selected period
        setPeriods(updatedPeriods); // Update the parent state
    };

    return (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">Opening Hours</h3>
            <ul className="space-y-4">
                {openingPeriods.map((period, index) => (
                    <li key={index} className="flex items-center space-x-4">
                        <select
                            value={period.open.day}
                            onChange={(e) => handleChange(index, 'open', { day: Number(e.target.value), time: period.open.time })}
                            className="p-2 border rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value={0}>Select Day</option>
                            <option value={1}>Monday</option>
                            <option value={2}>Tuesday</option>
                            <option value={3}>Wednesday</option>
                            <option value={4}>Thursday</option>
                            <option value={5}>Friday</option>
                            <option value={6}>Saturday</option>
                            <option value={7}>Sunday</option>
                        </select>
                        <input
                            type="time"
                            value={convertTime(period.open.time)}
                            onChange={(e) => handleChange(index, 'open', { day: period.open.day, time: formatTime(e.target.value) })}
                            className="p-2 border rounded focus:outline-none focus:border-blue-500"
                        />
                        <span>to</span>
                        <select
                            value={period.close.day}
                            onChange={(e) => handleChange(index, 'close', { day: Number(e.target.value), time: period.close.time })}
                            className="p-2 border rounded focus:outline-none focus:border-blue-500"
                        >
                            <option value={0}>Select Day</option>
                            <option value={1}>Monday</option>
                            <option value={2}>Tuesday</option>
                            <option value={3}>Wednesday</option>
                            <option value={4}>Thursday</option>
                            <option value={5}>Friday</option>
                            <option value={6}>Saturday</option>
                            <option value={7}>Sunday</option>
                        </select>
                        <input
                            type="time"
                            value={convertTime(period.close.time)}
                            onChange={(e) => handleChange(index, 'close', { day: period.close.day, time: formatTime(e.target.value) })}
                            className="p-2 border rounded focus:outline-none focus:border-blue-500"
                        />
                        <button 
                            onClick={() => handleRemovePeriod(index)}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
            <button 
                onClick={handleAddPeriod}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
                Add Time Period
            </button>
        </div>
    );
}

export default OpeningHours;
