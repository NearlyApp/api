import { Controller, Get, Res  } from "@nestjs/common";
import { Response } from "express";

@Controller()
export class RootController {
    @Get("/health")
    health(@Res() res: Response) {
        res.send("OK")
    }
}