"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import IconButton from "./IconButton";
import {
	ArrowBigLeft,
	ArrowLeft,
	Circle,
	Eraser,
	MousePointer,
	Pen,
	Square,
} from "lucide-react";
import { Game } from "../Draw/Game";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetShapes } from "../api/use-get-shapes";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

export enum Tools {
	PEN = "pen",
	CIRCLE = "circle",
	SQUARE = "ract",
	Line = "line",
	SELECTION = "selection",
	ERASER = "eraser",
}

interface Props {
	roomId?: Id<"rooms">;
	workspaceId?: Id<"workspaces">;
	conversationId?: Id<"conversations">;
}
export interface Data {
	_id: Id<"shapes">;
	_creationTime: number;
	conversationId?: Id<"conversations"> | undefined;
	workspaceId: Id<"workspaces">;
	body: string;
	memberId: Id<"members">;
	roomId: Id<"rooms">;
}

type RequestType = {
	body: string;
	roomId: Id<"rooms">;
	workspaceId: Id<"workspaces">;
	memberId: Id<"members">;
	conversationId?: Id<"conversations">;
};

type UpdateShapeType = {
	body: string;
	id: Id<"shapes">;
};
type DeleteShapeType = {
	id: Id<"shapes">;
};

type ResponseType = Id<"shapes"> | null;
type Options = {
	onSuccess?: (response: ResponseType) => void;
	onError?: (error: Error) => void;
	onSettled?: () => void;
	throwError?: boolean;
};
export type CreateShapeType = RequestType;
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
	const [shapes, setShapes] = useState<any[] | null | undefined>([]);
	const mutation = useMutation(api.shapes.create);
	const updateMutation = useMutation(api.shapes.updateById);
	const deleteMutation = useMutation(api.shapes.deleteById);

	const mutate = useCallback(
		async (values: RequestType, options?: Options) => {
			try {
				const response = await mutation(values);
				options?.onSuccess?.(response as ResponseType);
				return response;
			} catch (error) {
				// setStatus("error");
				options?.onError?.(error as Error);
				if (options?.throwError) throw error;
			} finally {
				// setStatus("settled");
				options?.onSettled?.();
			}
		},
		[mutation]
	);
	const updateMutate = useCallback(
		async (values: UpdateShapeType, options?: Options) => {
			try {
				const response = await updateMutation(values);
				options?.onSuccess?.(response as ResponseType);
				return response;
			} catch (error) {
				// setStatus("error");
				options?.onError?.(error as Error);
				if (options?.throwError) throw error;
			} finally {
				// setStatus("settled");
				options?.onSettled?.();
			}
		},
		[updateMutation]
	);
	const deleteMutate = useCallback(
		async (values: DeleteShapeType, options?: Options) => {
			try {
				const response = await deleteMutation(values);
				options?.onSuccess?.(response as ResponseType);
				return response;
			} catch (error) {
				// setStatus("error");
				options?.onError?.(error as Error);
				if (options?.throwError) throw error;
			} finally {
				// setStatus("settled");
				options?.onSettled?.();
			}
		},
		[deleteMutation]
	);
	const data = useQuery(api.shapes.get, {
		roomId,
		workspaceId,
		// conversationId,
	});
	console.log(data);
	const useGetShapes = ({ roomId, workspaceId, conversationId }: Props) => {
		const data = useQuery(api.shapes.get, {
			roomId,
			workspaceId,
			conversationId,
		});
		const isLoading = data === undefined;
		return { data, isLoading };
	};
	function getShapes() {
		console.log(data);
		return data;
	}

	async function createShapes(shape: CreateShapeType) {
		await mutate(shape, { throwError: true });
	}

	async function updateShapes(data: UpdateShapeType) {
		await updateMutate(data, { throwError: true });
	}

	async function deleteShapes(data: DeleteShapeType) {
		await deleteMutate(data, { throwError: true });
	}
	useEffect(() => {
		if (canvasRef.current) {
			const canvas = canvasRef.current;
			const g = new Game(
				canvas,
				roomId,
				workspaceId,
				memberId,
				getShapes,
				createShapes,
				updateShapes,
				deleteShapes
			);
			setGame(g);
			return () => {
				g.destroy();
			};
		}
	}, [canvasRef, roomId, workspaceId, memberId, data]);

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
	const workspaceId = useWorkspaceId();
	return (
		<>
			<div className="transition flex gap-2 p-2 text-sm fixed top-2 rounded-md left-[4%] transform -translate-x-1/2 text-white group">
				<Link
					href={`/workspace/${workspaceId}`}
					className="group-hover:scale-105"
				>
					<ArrowLeft className="group-hover:scale-200 group-hover:text-rose-600"/>
				</Link>
			</div>
			<div className="flex gap-2 border p-2 text-sm fixed top-2 rounded-md left-[50%] transform -translate-x-1/2  text-white">
				<IconButton
					activated={selectedTool === Tools.SELECTION}
					icon={<MousePointer />}
					onClick={() => {
						setSelectedTool(Tools.SELECTION);
					}}
				/>
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
				<IconButton
					activated={selectedTool === Tools.ERASER}
					icon={<Eraser />}
					onClick={() => {
						setSelectedTool(Tools.ERASER);
					}}
				/>
			</div>
		</>
	);
}
