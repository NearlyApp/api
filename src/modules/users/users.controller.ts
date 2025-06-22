import { UsersService } from "@modules/users/users.service";
import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get(':identifier')
    @HttpCode(HttpStatus.OK)
    async getUser(@Param('identifier') identifier: string) {
        return this.usersService.getUser(identifier);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getUsers() {
        return this.usersService.getUsers();
    }
}