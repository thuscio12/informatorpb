import { getFieldsOfStudy } from '@/ssg/fieldofstudy';
import { Graduate } from '@/ssg/graduate';
import { getScienceContent } from '@/ssg/science';

type KierunekProps = ReturnType<typeof getFieldsOfStudy> extends Array<infer R> ? R : never;
type ScienceProps = ReturnType<typeof getScienceContent> extends Array<infer R> ? R : never;
type AbsolwentProps = ReturnType<typeof Graduate> extends Array<infer R> ? R : never;

export type ContentPageProps = KierunekProps | ScienceProps | AbsolwentProps;
