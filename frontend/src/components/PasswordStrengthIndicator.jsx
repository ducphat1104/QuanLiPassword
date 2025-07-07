import React from 'react';
import zxcvbn from 'zxcvbn';

/**
 * Component hiển thị độ mạnh mật khẩu với thanh tiến trình và gợi ý cải thiện
 * Sử dụng thư viện zxcvbn để đánh giá độ mạnh mật khẩu
 */
const PasswordStrengthIndicator = ({ password, showDetails = true }) => {
    if (!password) return null;

    const result = zxcvbn(password);
    const score = result.score; // 0-4 (0 = rất yếu, 4 = rất mạnh)

    /**
     * Chuyển đổi điểm số thành text tiếng Việt
     * @param {number} score - Điểm từ 0-4
     * @returns {string} - Mô tả độ mạnh bằng tiếng Việt
     */
    const getStrengthText = (score) => {
        switch (score) {
            case 0:
                return 'Rất yếu';
            case 1:
                return 'Yếu';
            case 2:
                return 'Trung bình';
            case 3:
                return 'Mạnh';
            case 4:
                return 'Rất mạnh';
            default:
                return 'Không xác định';
        }
    };

    /**
     * Lấy màu sắc cho thanh tiến trình dựa trên điểm số
     * @param {number} score - Điểm từ 0-4
     * @returns {string} - CSS class cho background color
     */
    const getStrengthColor = (score) => {
        switch (score) {
            case 0:
                return 'bg-red-500';      // Đỏ - Rất yếu
            case 1:
                return 'bg-orange-500';   // Cam - Yếu
            case 2:
                return 'bg-yellow-500';   // Vàng - Trung bình
            case 3:
                return 'bg-blue-500';     // Xanh dương - Mạnh
            case 4:
                return 'bg-green-500';    // Xanh lá - Rất mạnh
            default:
                return 'bg-gray-300';     // Xám - Mặc định
        }
    };

    /**
     * Lấy màu chữ cho text hiển thị độ mạnh
     * @param {number} score - Điểm từ 0-4
     * @returns {string} - CSS class cho text color
     */
    const getTextColor = (score) => {
        switch (score) {
            case 0:
                return 'text-red-600';    // Đỏ đậm - Rất yếu
            case 1:
                return 'text-orange-600'; // Cam đậm - Yếu
            case 2:
                return 'text-yellow-600'; // Vàng đậm - Trung bình
            case 3:
                return 'text-blue-600';   // Xanh dương đậm - Mạnh
            case 4:
                return 'text-green-600';  // Xanh lá đậm - Rất mạnh
            default:
                return 'text-gray-600';   // Xám đậm - Mặc định
        }
    };

    /**
     * Dịch các cảnh báo và gợi ý từ tiếng Anh sang tiếng Việt
     * @param {string} text - Text tiếng Anh từ zxcvbn
     * @returns {string} - Text đã dịch sang tiếng Việt
     */
    const translateFeedback = (text) => {
        const translations = {
            // Warnings - Cảnh báo
            'This is a top-10 common password': 'Đây là một trong 10 mật khẩu phổ biến nhất',
            'This is a top-100 common password': 'Đây là một trong 100 mật khẩu phổ biến nhất',
            'This is a very common password': 'Đây là mật khẩu rất phổ biến',
            'This is similar to a commonly used password': 'Mật khẩu này tương tự với các mật khẩu thường dùng',
            'A word by itself is easy to guess': 'Một từ đơn lẻ rất dễ đoán',
            'Names and surnames by themselves are easy to guess': 'Tên và họ riêng lẻ rất dễ đoán',
            'Common names and surnames are easy to guess': 'Tên và họ phổ biến rất dễ đoán',
            'Straight rows of keys are easy to guess': 'Các phím liên tiếp trên bàn phím rất dễ đoán',
            'Short keyboard patterns are easy to guess': 'Các mẫu bàn phím ngắn rất dễ đoán',
            'Repeats like "aaa" are easy to guess': 'Các ký tự lặp lại như "aaa" rất dễ đoán',
            'Repeats like "abcabcabc" are only slightly harder to guess than "abc"': 'Các mẫu lặp như "abcabcabc" chỉ khó đoán hơn "abc" một chút',
            'Sequences like abc or 6543 are easy to guess': 'Các chuỗi như abc hoặc 6543 rất dễ đoán',
            'Recent years are easy to guess': 'Các năm gần đây rất dễ đoán',
            'Dates are often easy to guess': 'Ngày tháng thường rất dễ đoán',

            // Suggestions - Gợi ý
            'Use a longer keyboard pattern with more turns': 'Sử dụng mẫu bàn phím dài hơn với nhiều thay đổi hướng',
            'Add another word or two. Uncommon words are better.': 'Thêm một hoặc hai từ nữa. Từ không phổ biến sẽ tốt hơn.',
            'Capitalization doesn\'t help very much': 'Viết hoa không giúp ích nhiều',
            'All-uppercase is almost as easy to guess as all-lowercase': 'Toàn chữ hoa gần như dễ đoán bằng toàn chữ thường',
            'Reversed words aren\'t much harder to guess': 'Từ viết ngược không khó đoán hơn nhiều',
            'Predictable substitutions like \'@\' instead of \'a\' don\'t help very much': 'Các thay thế dễ đoán như \'@\' thay vì \'a\' không giúp ích nhiều',
            'Avoid repeated words and characters': 'Tránh lặp lại từ và ký tự',
            'Avoid sequences': 'Tránh các chuỗi tuần tự',
            'Avoid recent years': 'Tránh các năm gần đây',
            'Avoid years that are associated with you': 'Tránh các năm liên quan đến bạn',
            'Avoid dates and years that are associated with you': 'Tránh ngày tháng và năm liên quan đến bạn',
            'No need for symbols, digits, or uppercase letters': 'Không cần ký tự đặc biệt, số hoặc chữ hoa'
        };

        return translations[text] || text;
    };

    /**
     * Dịch thời gian bẻ khóa sang tiếng Việt
     * @param {string} timeText - Text thời gian từ zxcvbn
     * @returns {string} - Text thời gian đã dịch
     */
    const translateCrackTime = (timeText) => {
        const timeTranslations = {
            'less than a second': 'ít hơn 1 giây',
            'instant': 'tức thì',
            'seconds': 'giây',
            'minutes': 'phút',
            'hours': 'giờ',
            'days': 'ngày',
            'months': 'tháng',
            'years': 'năm',
            'centuries': 'thế kỷ'
        };

        let translatedTime = timeText;
        Object.keys(timeTranslations).forEach(key => {
            translatedTime = translatedTime.replace(new RegExp(key, 'gi'), timeTranslations[key]);
        });

        return translatedTime;
    };

    return (
        <div className="mt-2">
            {/* Thanh tiến trình hiển thị độ mạnh mật khẩu */}
            <div className="flex space-x-1 mb-2">
                {[0, 1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={`h-2 flex-1 rounded ${level <= score ? getStrengthColor(score) : 'bg-gray-200'
                            }`}
                    />
                ))}
            </div>

            {/* Text hiển thị độ mạnh */}
            <div className={`text-sm font-medium ${getTextColor(score)}`}>
                Độ mạnh: {getStrengthText(score)}
            </div>

            {/* Chi tiết cảnh báo và gợi ý cải thiện */}
            {showDetails && (
                <div className="mt-2 text-xs text-gray-600">
                    {/* Hiển thị cảnh báo nếu có */}
                    {result.feedback.warning && (
                        <div className="text-orange-600 mb-1">
                            ⚠️ {translateFeedback(result.feedback.warning)}
                        </div>
                    )}

                    {/* Hiển thị gợi ý cải thiện */}
                    {result.feedback.suggestions.length > 0 && (
                        <div>
                            <div className="font-medium mb-1">Gợi ý cải thiện:</div>
                            <ul className="list-disc list-inside space-y-1">
                                {result.feedback.suggestions.map((suggestion, index) => (
                                    <li key={index}>{translateFeedback(suggestion)}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Hiển thị thời gian bẻ khóa ước tính */}
                    {result.crack_times_display && (
                        <div className="mt-2">
                            <span className="font-medium">Thời gian bẻ khóa ước tính: </span>
                            {translateCrackTime(result.crack_times_display.offline_slow_hashing_1e4_per_second)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthIndicator;
