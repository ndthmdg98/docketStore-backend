import {CreateAppUserDto, CreateB2BUserDto} from "../../dto/auth.dto";


export const  createAppUserDto = new CreateAppUserDto( "nicodiefenbacher@web.de",  "passwort123", "Nico",
    "Diefenbacher",
    "015904379121")
export const loginAppDto = {username: "nicodiefenbacher@web.de", password: "passwort123"}
export const  falseLoginDto1 = {username: "nicodiefen@web.de", password: "passwort12"}
export const  falseLoginDto2 = {username: "nicodiefen@web.de", password: "passwort123"}
export const  falseLoginDto3 = {username: "nicodiefenbacher@web.de", password: "passwort13"}
export const  createB2BUserDto = new CreateB2BUserDto( "nicodiefuse@web.de",  "passwort123", "Nico",
    "Diefenbacher",  "015904379121",  "nicodiefuse@web.de",  "TestCompany",  "Category",  "187", "Backerstreet",  "15",  "Karlsruhe", "75056", "Deutschland")

export const  createB2BUserErrorDto = new CreateB2BUserDto( "blabla@web.de",  "passwort123", undefined,
    "Diefenbacher",  "015904379121",  null,  "TestCompany",  "Category",  "187", "Backerstreet",  "15",  "Karlsruhe", "75056", "Deutschland")

export const  loginB2BDto = {username: "nicodiefuse@web.de", password: "passwort123"}

export const registerCodeMock = "123456789"
export const mailServiceMock = {
    sendWelcomeEmail: () => Promise.resolve(true),

};
export const codeGeneratorServiceMock = {
    generateCode: () => registerCodeMock,
}
