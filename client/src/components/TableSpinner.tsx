

const TableSpinner = () => {
    return (
        <div className="min-w-full divide-y-2 divide-black/5 rounded-md backdrop-blur-md py-36 my-10 min-h-max overflow-x-auto overflow-y-auto [box-shadow:0_0_10px_rgba(0,0,0,1)] justify-center items-end content-center flex">
            <div
                className="text-[#3c0d0d] inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status">
            </div>
        </div>
    );
}

export default TableSpinner;