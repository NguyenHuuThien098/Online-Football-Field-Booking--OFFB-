import style from "./SearchTool.module.scss";
import React from "react";

const SearchTool = ({ searchParams, setSearchParams, searchFields }) => {
    const validTypes = ['5 người', '7 người', '11 người']; // Các loại sân hợp lệ

    // Cập nhật giá trị input
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setSearchParams((prev) => ({ ...prev, [id]: value }));
    };

    // Thực hiện tìm kiếm khi nhấn Enter trong trường "name"
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            searchFields();
        }
    };

    // Kiểm tra dữ liệu trước khi tìm kiếm
    const handleSearch = () => {
        if (!searchParams.name.trim() && !searchParams.date && !searchParams.type) {
            alert("Vui lòng nhập ít nhất một tiêu chí tìm kiếm.");
            return;
        }
        searchFields();
    };

    return (
        <>
            <div className={`${style.searchTool} row d-flex align-items-center`}>
                <div className="col-4">
                    <input
                        type="text"
                        id="name"
                        value={searchParams.name || ""}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        className={`${style.input} border border-black rounded-pill h-50 w-100 mx-4`}
                        placeholder="🔎 Tìm kiếm tên sân"
                    />
                </div>
                <div className="col-1 text-center">
                    <label htmlFor="date">Ngày</label>
                </div>
                <div className="col-1">
                    <input
                        type="date"
                        id="date"
                        value={searchParams.date || ""}
                        onChange={handleInputChange}
                        className="rounded h-50 w-75 border"
                    />
                </div>
                <div className="col text-center">
                    <label htmlFor="startTime">Từ</label>
                </div>
                <div className="col">
                    <input
                        type="time"
                        id="startTime"
                        value={searchParams.startTime || ""}
                        onChange={handleInputChange}
                        className="rounded h-50 w-75 border"
                    />
                </div>
                <div className="col text-center">
                    <label htmlFor="endTime">Đến</label>
                </div>
                <div className="col">
                    <input
                        type="time"
                        id="endTime"
                        value={searchParams.endTime || ""}
                        onChange={handleInputChange}
                        className="rounded h-50 w-75 border"
                    />
                </div>
                <div className="col text-center">
                    <label htmlFor="type">Loại sân</label>
                </div>
                <div className="col">
                    <select
                        id="type"
                        value={searchParams.type || ""}
                        onChange={handleInputChange}
                        className="w-100 h-50 border rounded"
                    >
                        <option value="">Chọn loại sân</option>
                        {validTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col">
                    <button
                        className="btn btn-primary w-100 h-50"
                        onClick={handleSearch}
                    >
                        Tìm kiếm
                    </button>
                </div>
            </div>
            <hr className="mx-5 my-0" />
        </>
    );
};

export default SearchTool;
