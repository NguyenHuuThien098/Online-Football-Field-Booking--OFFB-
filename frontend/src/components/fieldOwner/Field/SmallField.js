const SmallField = ({ field }) => {
    const { name, address, image, id } = field;
    const history = useHistory();
    const handleFieldDetail = () => {
        history.push(`/fieldDetail/${id}`);
    };
    return (
        <div className="smallField" onClick={handleFieldDetail}>
            <img src={image} alt={name} />
            <div className="smallField__info">
                <h3>{name}</h3>
                <p>{address}</p>
            </div>
        </div>
    );
}