import { profile } from 'console';
import { User } from '../models/user.model';
import { UserProfile } from '../models/userProfile.model';
const profileUrl = "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg";

const users = [
    {
        username: 'paulatreides',
        email: 'paul.atreides@arrakis.com',
        password: 'muadib2024',
        userProfile: {
            about: 'Destined leader of the Fremen and the Kwisatz Haderach.',
            profileUrl
        },
    },
    {
        username: 'ladyjessica',
        email: 'lady.jessica@arrakis.com',
        password: 'benegesserit2024',
        userProfile: {
            about: 'Bene Gesserit sister, devoted mother of Paul Atreides.',
            profileUrl
        },
    },
    {
        username: 'dukeleto',
        email: 'duke.leto@atreides.com',
        password: 'caladan2024',
        userProfile: {
            about: 'The noble and fair ruler of Caladan, Duke of House Atreides.',
            profileUrl
        },
    },
    {
        username: 'duncanidaho',
        email: 'duncan.idaho@atreides.com',
        password: 'swordmaster2024',
        userProfile: {
            about: 'Master swordsman, loyal to House Atreides and friend of Paul.',
            profileUrl
        },
    },
    {
        username: 'gurneyhalleck',
        email: 'gurney.halleck@atreides.com',
        password: 'baliset2024',
        userProfile: {
            about: 'Warrior-poet, skilled in combat and music. Plays the baliset.',
            profileUrl
        },
    },
    {
        username: 'stilgar',
        email: 'stilgar@fremen.com',
        password: 'sietch2024',
        userProfile: {
            about: 'Leader of Sietch Tabr, fierce protector of the desert ways.',
            profileUrl
        },
    },
    {
        username: 'chani',
        email: 'chani@fremen.com',
        password: 'desertrose2024',
        userProfile: {
            about: 'Fremen warrior and beloved companion of Paul Atreides.',
            profileUrl
        },
    },
    {
        username: 'baronharkonnen',
        email: 'baron.harkonnen@harkonnen.com',
        password: 'giedi2024',
        userProfile: {
            about: 'Cunning and ruthless ruler of House Harkonnen.',
            profileUrl
        },
    },
    {
        username: 'feydrautha',
        email: 'feyd.rautha@harkonnen.com',
        password: 'gladiator2024',
        userProfile: {
            about: 'Nephew of Baron Harkonnen, groomed for deadly ambitions.',
            profileUrl
        },
    },
    {
        username: 'thufirhawat',
        email: 'thufir.hawat@atreides.com',
        password: 'mentat2024',
        userProfile: {
            about: 'Mentat and strategist, fiercely loyal to House Atreides.',
            profileUrl
        },
    },
];

export const seedUsers = async () => {
    await User.bulkCreate(users, {
        include: {
            model: UserProfile,
            as: 'userProfile',
        },
    });
};
