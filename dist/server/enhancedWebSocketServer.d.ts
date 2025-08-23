import http from "http";
declare class EnhancedOthelloWebSocketServer {
    private wss;
    constructor(serverOrPort?: http.Server | number);
    private handleMessage;
    private createRoom;
    private joinRoom;
    private joinRandom;
    private makeMove;
    private restartGame;
    private getRoomInfo;
    private resignGame;
    private offerDraw;
    private acceptDraw;
    private declineDraw;
    private handleDisconnect;
    private sendMessage;
    private sendError;
    private broadcastToRoom;
}
export default EnhancedOthelloWebSocketServer;
