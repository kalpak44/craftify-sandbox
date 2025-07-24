import { useState } from 'react';

const formDefinition = {
    name: 'Registration Form',
    fields: [
        { type: 'TEXT', label: 'First Name', placeholder: 'John', required: true },
        { type: 'TEXT', label: 'Last Name', placeholder: 'Doe', required: true },
        { type: 'EMAIL', label: 'Email', placeholder: 'john@example.com', required: true },
        { type: 'NUMBER', label: 'Age', placeholder: '30', required: false },
        { type: 'DATE', label: 'Date of Birth', placeholder: '', required: false },
        { type: 'DROPDOWN', label: 'Country', required: true, options: ['Germany', 'Austria', 'Switzerland'] },
        { type: 'RADIO', label: 'Gender', required: false, options: ['Male', 'Female', 'Other'] },
        { type: 'CHECKBOX', label: 'Interests', required: false, options: ['AI', 'UX', 'Development'] },
        { type: 'TEXTAREA', label: 'Bio', placeholder: 'Tell us something about yourself...', required: false }
    ]
};

export const FormViewPage = () => {
    const [formData, setFormData] = useState({});

    const handleChange = (label, value) => {
        setFormData((prev) => ({ ...prev, [label]: value }));
    };

    const handleCheckboxChange = (label, option, checked) => {
        setFormData((prev) => {
            const current = prev[label] || [];
            return {
                ...prev,
                [label]: checked ? [...current, option] : current.filter((o) => o !== option)
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    const labelStyle = "block text-sm font-semibold text-gray-300 mb-2 tracking-wide";
    const inputStyle =
        "w-full px-4 py-2 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white px-6 py-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-10 text-center">{formDefinition.name}</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {formDefinition.fields.map((field, index) => {
                        const key = `field-${index}`;
                        const label = field.label;

                        const isLastSingle =
                            formDefinition.fields.length % 2 === 1 &&
                            index === formDefinition.fields.length - 1;

                        const isForceFullWidth = ['TEXTAREA', 'CHECKBOX'].includes(field.type);
                        const baseClass = (isLastSingle || isForceFullWidth) ? "md:col-span-2" : "";

                        switch (field.type) {
                            case 'TEXT':
                            case 'EMAIL':
                            case 'NUMBER':
                            case 'DATE':
                                return (
                                    <div key={key} className={baseClass}>
                                        <label className={labelStyle}>
                                            {label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type={field.type.toLowerCase()}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            className={inputStyle}
                                            onChange={(e) => handleChange(label, e.target.value)}
                                        />
                                    </div>
                                );

                            case 'TEXTAREA':
                                return (
                                    <div key={key} className="md:col-span-2">
                                        <label className={labelStyle}>{label}</label>
                                        <textarea
                                            rows={4}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            className={inputStyle}
                                            onChange={(e) => handleChange(label, e.target.value)}
                                        />
                                    </div>
                                );

                            case 'DROPDOWN':
                                return (
                                    <div key={key} className={baseClass}>
                                        <label className={labelStyle}>{label}</label>
                                        <select
                                            required={field.required}
                                            className={inputStyle}
                                            onChange={(e) => handleChange(label, e.target.value)}
                                        >
                                            <option value="">Select...</option>
                                            {field.options.map((opt, i) => (
                                                <option key={i} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                );

                            case 'RADIO':
                                return (
                                    <div key={key} className={baseClass}>
                                        <label className={labelStyle}>{label}</label>
                                        <div className="flex flex-wrap gap-4">
                                            {field.options.map((opt, i) => (
                                                <label key={i} className="flex items-center gap-2 text-gray-200">
                                                    <input
                                                        type="radio"
                                                        name={label}
                                                        value={opt}
                                                        className="accent-blue-500"
                                                        onChange={(e) => handleChange(label, e.target.value)}
                                                    />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );

                            case 'CHECKBOX':
                                return (
                                    <div key={key} className="md:col-span-2">
                                        <label className={labelStyle}>{label}</label>
                                        <div className="flex flex-wrap gap-4">
                                            {field.options.map((opt, i) => (
                                                <label key={i} className="flex items-center gap-2 text-gray-200">
                                                    <input
                                                        type="checkbox"
                                                        value={opt}
                                                        className="accent-blue-500"
                                                        onChange={(e) =>
                                                            handleCheckboxChange(label, opt, e.target.checked)
                                                        }
                                                    />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );

                            default:
                                return null;
                        }
                    })}

                    <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-800 mt-10">
                        <button
                            type="button"
                            className="px-6 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition"
                            onClick={() => setFormData({})}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
