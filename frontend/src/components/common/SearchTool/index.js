import style from "./SearchTool.module.scss"
const SearchTool = () => {
    return (
        <>
            <div className={style.height_10 + " row d-flex align-items-center"} >
                <div className="col-4">
                    <input type="text" className={style.height_50 + " vh-50 border border-black rounded-pill h-50 w-100 mx-4"} placeholder="  🔎 Search" />
                </div>
                <div className="col-1 text-center">
                    <label for="">Day</label>
                </div>
                <div className="col-1">
                    <input placeholder=" 10/10 ⏷" className="rounded h-50 w-75 border" type="text" onfocus="(this.type='date')" onblur="(this.type='text')" id="date" />
                </div>
                <div className="col text-center">
                    <label for="">From</label>
                </div>
                <div className="col">
                    <input placeholder=" 5:00 PM ⏷" className="rounded h-50 w-75 border" type="text" onfocus="(this.type='time')" onblur="(this.type='text')" id="time" />
                </div>
                <div className="col text-center">
                    <label for="">To</label>
                </div>
                <div className="col">
                    <input placeholder=" 9:00 PM ⏷" className="rounded h-50 w-75 border" type="text" onfocus="(this.type='time')" onblur="(this.type='text')" id="time" />
                </div>
                <div className="col text-center">
                    <label for="">Time</label>
                </div>
                <div className="col">
                    <input placeholder="  1" type="number" className="w-50 h-50 border rounded" />
                </div>
                <div className="col">
                    <label for="">hours</label>
                </div>
            </div>
            <hr class="mx-5 my-0" />
        </>

    );
};

export default SearchTool;