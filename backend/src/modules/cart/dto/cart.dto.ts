import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Max, Min, ValidateNested } from 'class-validator';

export class UpsertCartItemDto {
    @IsString()
    productId: string;

    @IsInt()
    @Min(1)
    @Max(999)
    quantity: number;
}

export class MergeCartDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpsertCartItemDto)
    items: UpsertCartItemDto[];
}
