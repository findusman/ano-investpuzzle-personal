import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt, IsOptional, IsNumber, IsBoolean } from "class-validator";


export class customeScenario {

    @IsNotEmpty()
    @IsString()
    public scenarioID: string;

    @IsNotEmpty()
    @IsNumber()
    public value: string;

}

