import { Controller, Get, HttpCode, HttpStatus, Res } from "@nestjs/common";
import { Response } from "express";

@Controller()
export class AppController {
    @Get("/health")
    @HttpCode(HttpStatus.OK)
    healthCheck(@Res() res: Response) {
        res.send("OK");
    }
}