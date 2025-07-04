import React, { useState, useEffect } from 'react';
import zxcvbn from 'zxcvbn';
import { FiKey, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { generatePassword } from '../utils/passwordGenerator';

// --- Sub-component for Strength Meter ---
const PasswordStrengthMeter = ({ score }) => {
    const strength = {
        0: { label: 'Rất yếu', color: 'bg-red-500', textColor: 'text-red-500' },
        1: { label: 'Yếu', color: 'bg-orange-500', textColor: 'text-orange-500' },
        2: { label: 'Trung bình', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
        3: { label: 'Mạnh', color: 'bg-blue-500', textColor: 'text-blue-500' },
        4: { label: 'Rất mạnh', color: 'bg-green-500', textColor: 'text-green-500' },
    };

    const currentStrength = strength[score];
    const widthPercentage = (score + 1) * 20;

    return (
        <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className={`h-2 rounded-full transition-all duration-300 ${currentStrength.color}`}
                    style={{ width: `${widthPercentage}%` }}
                ></div>
            </div>
            <p className={`text-sm mt-1 font-semibold ${currentStrength.textColor}`}>
                {currentStrength.label}
            </p>
        </div>
    );
};

// --- Main Component ---
const PasswordGeneratorInput = ({ password, onPasswordChange, placeholder }) => {
    const [options, setOptions] = useState({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
    });
    const [score, setScore] = useState(0);
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        if (password && password.length > 0) {
            const result = zxcvbn(password);
            setScore(result.score);
        } else {
            setScore(0);
        }
    }, [password]);

    const handleGeneratePassword = () => {
        const newPassword = generatePassword(options);
        onPasswordChange(newPassword);
    };

    return (
        <div className="mb-5">
            {/* --- Options Toggle Button --- */}
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold">Mật khẩu</label>
                <button
                    type="button"
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-sm text-blue-600 hover:underline flex items-center"
                >
                    Tùy chọn {showOptions ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
                </button>
            </div>
            
            {/* --- Advanced Options Panel --- */}
            {showOptions && (
                <div className="mb-3 p-4 bg-gray-50 rounded-lg border">
                    <div className="mb-4">
                        <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">Độ dài: {options.length}</label>
                        <input
                            type="range" id="length" min="8" max="64"
                            value={options.length}
                            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value, 10) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                            <input type="checkbox" id="uppercase" checked={options.includeUppercase} onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })} className="mr-2 h-4 w-4 rounded" />
                            <label htmlFor="uppercase">Chữ hoa (A-Z)</label>
                        </div>
                        <div>
                            <input type="checkbox" id="lowercase" checked={options.includeLowercase} onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })} className="mr-2 h-4 w-4 rounded" />
                            <label htmlFor="lowercase">Chữ thường (a-z)</label>
                        </div>
                        <div>
                            <input type="checkbox" id="numbers" checked={options.includeNumbers} onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })} className="mr-2 h-4 w-4 rounded" />
                            <label htmlFor="numbers">Số (0-9)</label>
                        </div>
                        <div>
                            <input type="checkbox" id="symbols" checked={options.includeSymbols} onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })} className="mr-2 h-4 w-4 rounded" />
                            <label htmlFor="symbols">Ký tự (!@#)</label>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Password Input Field --- */}
            <div className="relative">
                <input
                    type="text"
                    id="password"
                    value={password || ''} // Ensure value is never null/undefined
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10"
                    placeholder={placeholder || "••••••••"}
                />
                <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-blue-500 transition-colors"
                    title="Tạo mật khẩu ngẫu nhiên theo tùy chọn"
                >
                    <FiKey />
                </button>
            </div>

            {/* --- Strength Meter Display --- */}
            <div className="mt-2 h-6">
                {password && password.length > 0 && <PasswordStrengthMeter score={score} />}
            </div>
        </div>
    );
};

export default PasswordGeneratorInput;
