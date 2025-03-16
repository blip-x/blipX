import { useEffect, useRef, useState } from "react";
import IconButton from "./IconButton";
import { ArrowBigLeft, Circle, Pen, Square } from "lucide-react";
import { Game } from "../Draw/Game";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetShapes } from "../api/use-get-shapes";

export enum Tools {
	PEN = "pen",
	CIRCLE = "circle",
	SQUARE = "ract",
	Line = "line",
}
const Canvas = ({
	roomId,
	workspaceId,
	memberId,
}: {
	roomId: Id<"rooms">;
	workspaceId: Id<"workspaces">;
	memberId: Id<"members">;
}) => {
	const [selectedTool, setSelectedTool] = useState<Tools>(Tools.PEN);
	const [game, setGame] = useState<Game>();
	const canvasRef = useRef<HTMLCanvasElement>(null);

	async function getShapes() {
		const { data, isLoading } = await useGetShapes({
			roomId: roomId,
			workspaceId: workspaceId,
		});
        return {data, isLoading};
	}
	useEffect(() => {
		if (canvasRef.current) {
			const canvas = canvasRef.current;
			const g = new Game(canvas, roomId, workspaceId, memberId, getShapes);
			setGame(g);
			return () => {
				g.destroy();
			};
		}
	}, [canvasRef, roomId, workspaceId, memberId]);

	useEffect(() => {
		console.log(selectedTool);
		game?.setTool(selectedTool);
	}, [selectedTool, game]);
	return (
		<div className="h-screen overflow-hidden">
			<canvas
				ref={canvasRef}
				id="myCanvas"
				width={window.innerWidth}
				height={window.innerHeight}
				className=" border-gray-500 shadow-[0_10px_35px_#000]"
			></canvas>
			<TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
		</div>
	);
};

export default Canvas;

export function TopBar({
	selectedTool,
	setSelectedTool,
}: {
	selectedTool: Tools;
	setSelectedTool: React.Dispatch<React.SetStateAction<Tools>>;
}) {
	return (
		<div className="flex gap-2 border p-2 text-sm fixed top-2 rounded-md left-[50%] transform -translate-x-1/2  text-white">
			<IconButton
				activated={selectedTool === Tools.PEN}
				icon={<Pen />}
				onClick={() => {
					setSelectedTool(Tools.PEN);
				}}
			/>
			<IconButton
				activated={selectedTool === Tools.CIRCLE}
				icon={<Circle />}
				onClick={() => setSelectedTool(Tools.CIRCLE)}
			/>
			<IconButton
				activated={selectedTool === Tools.SQUARE}
				icon={<Square />}
				onClick={() => {
					setSelectedTool(Tools.SQUARE);
				}}
			/>
			<IconButton
				activated={selectedTool === Tools.Line}
				icon={
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<line
							x1="2"
							y1="12"
							x2="22"
							y2="12"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				}
				onClick={() => {
					setSelectedTool(Tools.Line);
				}}
			/>
		</div>
	);
}
