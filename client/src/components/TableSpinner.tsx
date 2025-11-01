
const TableSpinner = () => {
    return (
        <div className="grid grid-cols-1 justify-center content-center place-items-center">
            <div
                className="text-yellow-100 inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status">
            </div>
            <div className="text-white m-2 text-xl">
                Fetching data....
            </div>
        </div>
    );
}

export default TableSpinner;