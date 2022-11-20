import type { PickByType, SeparationArrayProperty } from "../typings/utils";
export interface UpdatePropertiesOptions<ObjectType extends object> {
    $set?: Partial<ObjectType>;
    $push?: Partial<SeparationArrayProperty<PickByType<ObjectType, any[]>>>;
    $pop?: Partial<{
        [K in keyof PickByType<ObjectType, any[]>]: number;
    }>;
    $unshift?: Partial<SeparationArrayProperty<PickByType<ObjectType, any[]>>>;
    $shift?: Partial<{
        [K in keyof PickByType<ObjectType, any[]>]: number;
    }>;
    $pull?: Partial<SeparationArrayProperty<PickByType<ObjectType, any[]>>>;
    $inc?: Partial<PickByType<ObjectType, number>>;
    $mul?: Partial<PickByType<ObjectType, number>>;
    $anti?: (keyof PickByType<ObjectType, boolean>)[];
    $concat?: Partial<PickByType<ObjectType, string>>;
}
export default function <Original extends object>(_original: Original, updateOption: UpdatePropertiesOptions<Original>): any;
