import React from "react";
import TextField from '@mui/material/TextField';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


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
        <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'space-between',
        }}>
            <TextField id="name" label="🔎 Tìm kiếm tên sân" variant="outlined"
                value={searchParams.name || ""}
                onChange={handleInputChange} />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    id="date"
                    onKeyDown={handleKeyPress}
                    label="Ngày"
                    value={searchParams.date || null}
                    onChange={(newValue) => setSearchParams({
                        ...searchParams,
                        date: newValue
                    })}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                        />
                    )}
                />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                    label="Giờ bắt đầu"
                    value={searchParams.date || null}
                    onChange={(newValue) => setSearchParams({
                        ...searchParams,
                        startTime: newValue
                    })}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                        />
                    )}
                />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                    label="Giờ kết thúc"
                    value={searchParams.date || null}
                    onChange={(newValue) => setSearchParams({
                        ...searchParams,
                        endTime: newValue
                    })}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                        />
                    )}
                />
            </LocalizationProvider>
            <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="demo-simple-select-label">Loại sân</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="type"
                    value={searchParams.type || ""}
                    label="Loại sân"
                    onChange={(e) => setSearchParams({
                        ...searchParams,
                        type: e.target.value
                    })}
                >
                    {
                        validTypes.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
            <Button variant="contained" onClick={handleSearch}>Tìm</Button>
            {/* <div className={`${style.searchTool} row d-flex align-items-center`}>
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
            <hr className="mx-5 my-0" /> */}
        </div>
    );
};

export default SearchTool;
