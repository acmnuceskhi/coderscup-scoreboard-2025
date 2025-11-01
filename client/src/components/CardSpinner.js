
const CardSpinner = (props) => {

    const getSpinnerColor = (house) => {
        if (house === "Red Devils") {
            return { color: "red", opacity: 0.6 };
        }
        else if (house === "Galacticos") {
            return { color: "blue", opacity: 0.6 };
        }
        else if (house === "Gunners") {
            return { color: "red", opacity: 0.6 };
        }
        else if (house === "Culers") {
            return { color: "yellow", opacity: 0.6 };
        }
        else {
            return { color: "white", opacity: 0.6 }
        }
    }

    return (
        <div className="grid grid-cols-1 justify-center content-center place-items-center">
            <div
                className="text-white inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                style={getSpinnerColor(props.house)}
                role="status">
            </div>
        </div>
    );
}

export default CardSpinner;