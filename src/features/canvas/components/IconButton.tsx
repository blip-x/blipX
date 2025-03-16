import { ReactNode } from "react"

function IconButton({ icon, onClick, activated }: { icon: ReactNode, onClick: () => void, activated: boolean }) {
    return (
        <div onClick={onClick} className={`text-sm p-1 cursor-pointer hover:text-red-500 ${activated ? 'text-red-500' : ''} `}>
            {icon}
        </div>
    )
}

export default IconButton