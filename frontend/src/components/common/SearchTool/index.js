import React from "react";
import { TextField, Stack, Box, Divider, InputAdornment, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchTool = () => {
    return (
        <Box className="w-100 border-top border-bottom border-primary">
            { /* Divider */}
            <Stack
                className="shadow-sm"
                direction="row"
                alignItems="center"
                spacing={0}
                sx={{
                    px: 0,
                    py: 3,
                    backgroundColor: 'white'
                }}
            >
                {/* Day Selector */}
                {/* Day Selector */}
                <Box sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 1

                }}>
                    <Typography variant="body1" sx={{ minWidth: "50px" }}>Day</Typography>
                    <TextField
                        fullWidth
                        type="date"
                        variant="outlined"
                        InputProps={{
                            sx: {
                                borderRadius: 10,
                                height: 40,
                            },
                        }}
                    />
                </Box>

                {/* From Selector */}
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", px: 2 }}>
                    <Typography variant="body1" sx={{ minWidth: "50px" }}>From</Typography>
                    <TextField
                        fullWidth
                        type="time"
                        variant="outlined"
                        InputProps={{
                            sx: {
                                borderRadius: 10,
                                height: 40,
                            },
                        }}
                    />
                </Box>

                {/* To Selector */}
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", px: 2 }}>
                    <Typography variant="body1" sx={{ minWidth: "50px" }}>To</Typography>
                    <TextField
                        fullWidth
                        type="time"
                        variant="outlined"
                        InputProps={{
                            sx: {
                                borderRadius: 10,
                                height: 40,
                            },
                        }}
                    />
                </Box>


                {/* Duration */}
                <Box sx={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                        Time
                    </Typography>
                    <TextField
                        type="number" // Correct type for numeric input
                        placeholder="1"
                        variant="outlined"
                        InputProps={{
                            sx: {
                                borderRadius: 10,
                                height: 40,
                                width: "60px", // Đặt chiều rộng cố định để cân đối
                            },
                        }}
                    />
                    <Typography variant="body1" sx={{ ml: 1 }}>
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
                                height: 50,
                            },
                        }}
                    />
                </Box>
            </Stack>

            {/* Divider */}
            {/* <Divider sx={{ mx: 2, borderColor: "gray" }} /> */}
        </Box>
    );
};

export default SearchTool;
