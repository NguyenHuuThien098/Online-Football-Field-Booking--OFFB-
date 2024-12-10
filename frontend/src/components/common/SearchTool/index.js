import React from "react";
import { TextField, Stack, Box, InputAdornment, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchTool = () => {
    return (
        <Box
            className="w-100"
            sx={{
                borderTop: "10px solid #1976d2",
                borderBottom: "10px solid #1976d2",
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={0}
                sx={{
                    px: 0,
                    py: 3,
                    backgroundColor: "white",
                    color: "#1565c0"
                }}
            >
                {/* Day Selector */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        pl: 3,
                    }}
                >
                    <Typography variant="body1" sx={{ minWidth: "50px", fontWeight: 'bold' }}>
                        Day
                    </Typography>
                    <TextField
                        fullWidth
                        type="date"
                        variant="outlined"
                        InputProps={{
                            sx: {
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: "#1976d2",
                                "&:hover": {
                                    borderColor: "#1565c0",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderWidth: 1,
                                    borderColor: "#1565c0",
                                },
                            },
                        }}
                    />
                </Box>

                {/* From Selector */}
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", px: 2 }}>
                    <Typography variant="body1" sx={{ minWidth: "50px", fontWeight: 'bold' }}>
                        From
                    </Typography>
                    <TextField
                        fullWidth
                        type="time"
                        variant="outlined"
                        InputProps={{
                            sx: {
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: "#1976d2",
                                "&:hover": {
                                    borderColor: "#1565c0",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderWidth: 1,
                                    borderColor: "#1565c0",
                                },
                            },
                        }}
                    />
                </Box>

                {/* To Selector */}
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", px: 2 }}>
                    <Typography variant="body1" sx={{ minWidth: "50px", fontWeight: 'bold' }}>
                        To
                    </Typography>
                    <TextField
                        fullWidth
                        type="time"
                        variant="outlined"
                        InputProps={{
                            sx: {
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: "#1976d2",
                                "&:hover": {
                                    borderColor: "#1565c0",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderWidth: 1,
                                    borderColor: "#1565c0",
                                },
                            },
                        }}
                    />
                </Box>

                {/* Duration */}
                <Box sx={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="body1" sx={{ mr: 1 , fontWeight: 'bold'}}>
                        Time
                    </Typography>
                    <TextField
                        type="number"
                        placeholder="1"
                        variant="outlined"
                        InputProps={{
                            sx: {
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: "#1976d2",
                                "&:hover": {
                                    borderColor: "#1565c0",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderWidth: 1,
                                    borderColor: "#1565c0",
                                },
                            },
                        }}
                    />
                    <Typography variant="body1" sx={{ ml: 1, fontWeight: 'bold' }}>
                        Hours
                    </Typography>
                </Box>

                {/* Search Input */}
                <Box sx={{ px: 5, flex: 4 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 50,
                                borderWidth: 1,
                                borderColor: "#1976d2",
                                "&:hover": {
                                    borderColor: "#1565c0",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderWidth: 1,
                                    borderColor: "#1565c0",

                                },
                            },
                        }}
                    />
                </Box>
            </Stack>
        </Box>
    );
};

export default SearchTool;
