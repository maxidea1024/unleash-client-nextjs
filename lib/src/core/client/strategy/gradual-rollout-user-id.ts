// import { Strategy } from './strategy';
// import { Context } from '../context';
// import normalizedValue from '../../hash';

// export default class GradualRolloutUserIdStrategy extends Strategy {
//   constructor() {
//     super('gradualRolloutUserId');
//   }

//   isEnabled(parameters: any, context: Context) {
//     const { userId } = context;
//     if (!userId) {
//       return false;
//     }

//     const percentage = Number(parameters.percentage);
//     const groupId = parameters.groupId || '';

//     const normalizedUserId = normalizedValue(userId, groupId);
//     return percentage > 0 && normalizedUserId <= percentage;
//   }
// }
