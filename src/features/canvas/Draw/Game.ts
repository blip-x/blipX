import { Id } from "../../../../convex/_generated/dataModel";
import { useCreateShape } from "../api/use-create-shape";
import { useGetShapes } from "../api/use-get-shapes";
import { Tools } from "../components/Canvas";

type shape =
	| {
			type: "ract";
			x: number;
			y: number;
			width: number;
			height: number;
			memberId: Id<"members">;
	  }
	| {
			type: "circle";
			centerX: number;
			centerY: number;
			radius: Number;
			memberId: Id<"members">;
	  }
	| {
			type: "line";
			x1: number;
			y1: number;
			x2: number;
			y2: number;
			memberId: Id<"members">;
	  }
	| {
			type: "pen";
			inputpoint: number[][];
			memberId: Id<"members">;
	  };
export class Game {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private existingShape: shape[] = [];
	private roomId: Id<"rooms">;
	private workspaceId: Id<"workspaces">;
	private conversationId: Id<"conversations">;
	private memberId: Id<"members">;
	// private socket: WebSocket;
	private clicked = false;
	private StartX = 0;
	private StartY = 0;
	private centerX = 0;
	private centerY = 0;
	private width = 0;
	private height = 0;
	private selectedTool: Tools;
	private radius = 0;
	private figure: shape | null = null;
	private inputpoint: number[][] = [];

	constructor(
		canvas: HTMLCanvasElement,
		roomId: Id<"rooms">,
		workspaceId: Id<"workspaces">,
		memberId: Id<"members">,
		conversationId: Id<"conversations">
	) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d")!;
		this.roomId = roomId;
		this.workspaceId = workspaceId;
		this.memberId = memberId;
		this.conversationId = conversationId;
		this.clicked = false;
		this.selectedTool = Tools.SQUARE;
		this.init();
		this.initHandlers();
		this.clearCanvas();
		this.initMouseHandlers();
		this.setTool(this.selectedTool);
	}

	destroye() {
		this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
		this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
		this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
	}

	async init() {
		// todo get sha[er]
		{const {data, isLoading} = await useGetShapes({
			roomId: this.roomId,
			workspaceId: this.workspaceId,
			conversationId: this.conversationId,
		});

    if(!data?.length || isLoading) {
      this.existingShape = [];
    }

    if(data?.length && !isLoading) {
      this.existingShape = data?.map(shape => {
        const body = shape.body;
        return JSON.parse(body);
      });
    }
		console.log("existingshape", this.existingShape);
		this.clearCanvas();
	}

	setTool(tool: Tools) {
		console.log(tool);
		this.selectedTool = tool;
		console.log(this.selectedTool);
	}

	// initHandlers() {
	// 	this.socket.onmessage = (e) => {
	// 		const mess = JSON.parse(e.data);
	// 		if (mess.type === "chat") {
	// 			// get shpaer single
	// 			const parsedData = JSON.parse(mess.message);
	// 			this.existingShape.push(parsedData);
	// 			this.clearCanvas();
	// 		}
	// 	};
	// }

	clearCanvas() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = "black";
		this.existingShape.map((shape) => {
			console.log(shape);
			if (shape.type === "ract") {
				this.ctx.strokeStyle = "white";
				this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
			}
			if (shape.type === "circle") {
				this.ctx.beginPath();
				this.ctx.arc(
					shape.centerX,
					shape.centerY,
					Math.abs(Number(shape.radius)),
					0,
					2 * Math.PI
				);
				this.ctx.stroke();
				this.ctx.closePath();
			}
			if (shape.type === "pen") {
				console.log(shape.inputpoint);
				this.freeDraw(shape.inputpoint);
			}
			if (shape.type === "line") {
				this.ctx.beginPath();
				this.ctx.strokeStyle = "white";
				this.ctx.moveTo(shape.x1, shape.y1);
				this.ctx.lineTo(shape.x2, shape.y2);
				this.ctx.stroke();
				this.ctx.closePath();
			}
		});
	}
	freeDraw(inputpoint: number[][]) {
		if (inputpoint.length < 2) return;

		this.ctx.beginPath();
		this.ctx.strokeStyle = "white";
		this.ctx.moveTo(inputpoint[0][0], inputpoint[0][1]);

		for (let i = 1; i < inputpoint.length; i++) {
			this.ctx.lineTo(inputpoint[i][0], inputpoint[i][1]);
		}
		this.ctx.stroke();
		this.ctx.closePath();
	}

	mouseDownHandler = (e: MouseEvent) => {
		this.clicked = true;
		this.StartX = e.clientX;
		this.StartY = e.clientY;
		if (this.selectedTool === Tools.PEN) {
			this.inputpoint = [];
			this.inputpoint.push([this.StartX, this.StartY]);
		}
	};

	mouseMoveHandler = (e: MouseEvent) => {
		if (this.clicked) {
			this.width = e.clientX - this.StartX;
			this.height = e.clientY - this.StartY;
			this.clearCanvas();
			this.ctx.strokeStyle = "white";
			if (this.selectedTool === Tools.SQUARE) {
				this.ctx.strokeRect(this.StartX, this.StartY, this.width, this.height);
			} else if (this.selectedTool === Tools.CIRCLE) {
				this.centerX = this.StartX + this.width / 2;
				this.centerY = this.StartY + this.width / 2;
				this.radius = Math.max(this.width, this.height) / 2;
				this.ctx.beginPath();
				this.ctx.arc(
					this.centerX,
					this.centerY,
					Math.abs(this.radius),
					0,
					2 * Math.PI
				);
				this.ctx.stroke();
				this.ctx.closePath();
			} else if (this.selectedTool === Tools.PEN) {
				this.inputpoint.push([e.clientX, e.clientY]);
				this.freeDraw(this.inputpoint);
			} else if (this.selectedTool === Tools.Line) {
				this.ctx.strokeStyle = "white";
				this.ctx.beginPath();
				this.ctx.moveTo(this.StartX, this.StartY);
				this.ctx.lineTo(e.clientX, e.clientY);
				this.ctx.stroke();
				this.ctx.closePath();
			} else {
				return;
			}
		}
	};

	mouseUpHandler = (e: MouseEvent) => {
		this.clicked = false;
		if (this.selectedTool === Tools.SQUARE) {
			this.existingShape.push({
				type: "ract",
				x: this.StartX,
				y: this.StartY,
				width: this.width,
				height: this.height,
				memberId: this.memberId
			});

			this.figure = {
				type: "ract",
				x: this.StartX,
				y: this.StartY,
				width: this.width,
				height: this.height,
				memberId: this.memberId
			};
		} else if (this.selectedTool === Tools.CIRCLE) {
			this.existingShape.push({
				type: "circle",
				centerX: this.centerX,
				centerY: this.centerY,
				radius: Math.abs(this.radius),
				memberId: this.memberId
			});
			this.figure = {
				type: "circle",
				centerX: this.centerX,
				centerY: this.centerY,
				radius: Math.abs(this.radius),
				memberId: this.memberId
			};
		} else if (this.selectedTool === Tools.PEN) {
			this.figure = {
				type: "pen",
				inputpoint: this.inputpoint,
				memberId: this.memberId
			};
			this.existingShape.push(this.figure);
		} else if (this.selectedTool === Tools.Line) {
			this.figure = {
				type: "line",
				x1: this.StartX,
				y1: this.StartY,
				x2: e.clientX,
				y2: e.clientY,
				memberId: this.memberId
			};
			this.existingShape.push(this.figure);
		} else {
			return;
		}
		// save the shape in db
		// this.socket.send(
		// 	JSON.stringify({
		// 		type: "chat",
		// 		message: JSON.stringify(this.figure),
		// 		roomId: this.roomId,
		// 	})
		// );
		const {mutate} = useCreateShape();
		mutate({ body: JSON.stringify(this.figure), roomId: this.roomId, workspaceId: this.workspaceId, memberId: this.memberId, conversationId: this.conversationId }, {throwError: true})
		this.clearCanvas();
	};
	initMouseHandlers() {
		this.canvas.addEventListener("mousedown", this.mouseDownHandler);
		this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
		this.canvas.addEventListener("mouseup", this.mouseUpHandler);
	}
}
