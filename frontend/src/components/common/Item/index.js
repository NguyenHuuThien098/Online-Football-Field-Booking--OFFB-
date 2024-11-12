import style from "./Item.module.scss"

const item = () => {
    return (
        <div className="m-5">
            <div className= {style.br50 + " border border-black h-50 w-100"}>
            <div className="row h-100">
                <div className="col-4 border-end border-black"></div>
                <div className="col">
                    <div className="row d-flex flex-row-reverse">
                        <a href="FieldInformation-view.html" className="btn btn-primary m-5 h-100 w-auto">Booking</a>
                        <h3>Sân bóng bitcode</h3>
                        <h3>***</h3>
                        <p>Adress: 00 Duy Tân, Hòa Vang, TP. Đà Nẵng</p>
                        <p>Ghi chú: </p>
                        <p>Đánh giá: </p>
                    </div>

                </div>
            </div>
                
            </div>
            <hr className={style.hr}/>
        </div>
    );
};

export default item;