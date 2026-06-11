/** Avatar 3D estilo Bitmoji / Snapchat. */
export type AvatarGender = 'feminine' | 'masculine';

export type AvatarStudioSlot =
  | 'skin'
  | 'hairColor'
  | 'hairStyle'
  | 'eyes'
  | 'eyebrows'
  | 'top'
  | 'jacket'
  | 'bottom'
  | 'shoes'
  | 'headwear'
  | 'eyewear'
  | 'earrings'
  | 'necklace'
  | 'facialHair';

export type SkinToneId =
  | 'skin-1'
  | 'skin-2'
  | 'skin-3'
  | 'skin-4'
  | 'skin-5'
  | 'skin-6'
  | 'skin-7'
  | 'skin-8'
  | 'skin-9'
  | 'skin-10';

export type HairColorId =
  | 'hc-1'
  | 'hc-2'
  | 'hc-3'
  | 'hc-4'
  | 'hc-5'
  | 'hc-6'
  | 'hc-7'
  | 'hc-8'
  | 'hc-9'
  | 'hc-10'
  | 'hc-11'
  | 'hc-12';

export type HairStyleId =
  | 'hs-buzz'
  | 'hs-short'
  | 'hs-medium'
  | 'hs-long'
  | 'hs-bob'
  | 'hs-bun'
  | 'hs-ponytail'
  | 'hs-curly'
  | 'hs-wavy'
  | 'hs-braids';

export type EyeColorId = 'ec-1' | 'ec-2' | 'ec-3' | 'ec-4' | 'ec-5' | 'ec-6' | 'ec-7' | 'ec-8';
export type EyebrowId = 'eb-natural' | 'eb-thick' | 'eb-thin' | 'eb-arched' | 'eb-straight';
export type TopId =
  | 'top-tee-white'
  | 'top-tee-black'
  | 'top-tee-red'
  | 'top-tee-blue'
  | 'top-tee-green'
  | 'top-polo-navy'
  | 'top-polo-pink'
  | 'top-hoodie-gray'
  | 'top-hoodie-purple'
  | 'top-blouse-cream'
  | 'top-tank-black'
  | 'top-cardigan-beige'
  | 'top-vneck-blue'
  | 'top-stripes'
  | 'top-formal-white'
  | 'top-crop-lavender'
  | 'top-turtleneck-black'
  | 'top-graphic-teal';

export type JacketId =
  | 'jacket-none'
  | 'jacket-denim'
  | 'jacket-leather-black'
  | 'jacket-blazer-navy'
  | 'jacket-bomber-olive'
  | 'jacket-windbreaker-cyan'
  | 'jacket-coat-tan'
  | 'jacket-vest-orange'
  | 'jacket-cardigan-brown'
  | 'jacket-puffer-red';

export type BottomId =
  | 'bot-jeans-blue'
  | 'bot-jeans-black'
  | 'bot-chinos-khaki'
  | 'bot-chinos-navy'
  | 'bot-shorts-denim'
  | 'bot-shorts-black'
  | 'bot-skirt-black'
  | 'bot-skirt-plaid'
  | 'bot-joggers-gray'
  | 'bot-cargo-green'
  | 'bot-formal-gray'
  | 'bot-leggings-black'
  | 'bot-wide-cream'
  | 'bot-plaid-red';

export type ShoesId =
  | 'shoe-sneaker-white'
  | 'shoe-sneaker-black'
  | 'shoe-boot-brown'
  | 'shoe-boot-black'
  | 'shoe-loafer-brown'
  | 'shoe-heel-black'
  | 'shoe-sandal-tan'
  | 'shoe-hightop-red'
  | 'shoe-runner-blue'
  | 'shoe-formal-black'
  | 'shoe-slide-gray'
  | 'shoe-combat-black';

export type HeadwearId =
  | 'hat-none'
  | 'hat-cap-black'
  | 'hat-cap-red'
  | 'hat-beanie-navy'
  | 'hat-beanie-orange'
  | 'hat-bucket-khaki'
  | 'hat-beret-black'
  | 'hat-headband-sport'
  | 'hat-crown-gold'
  | 'hat-visor-teal'
  | 'hat-flower-crown';

export type EyewearId =
  | 'glasses-none'
  | 'glasses-round-black'
  | 'glasses-square-navy'
  | 'glasses-aviator-gold'
  | 'glasses-cat-pink'
  | 'glasses-sport-red'
  | 'glasses-shade-black'
  | 'glasses-shade-mirror'
  | 'glasses-reading-tortoise';

export type EarringId =
  | 'ear-none'
  | 'ear-studs-gold'
  | 'ear-studs-silver'
  | 'ear-hoops-gold'
  | 'ear-hoops-large'
  | 'ear-drops-pearl'
  | 'ear-drops-diamond';

export type NecklaceId = 'neck-none' | 'neck-chain-gold' | 'neck-chain-silver' | 'neck-pendant-star' | 'neck-choker-black' | 'neck-beads';

export type FacialHairId =
  | 'fh-none'
  | 'fh-stubble'
  | 'fh-beard-full'
  | 'fh-beard-short'
  | 'fh-goatee'
  | 'fh-mustache'
  | 'fh-mustache-handlebar';

export type StudioOptionId =
  | SkinToneId
  | HairColorId
  | HairStyleId
  | EyeColorId
  | EyebrowId
  | TopId
  | JacketId
  | BottomId
  | ShoesId
  | HeadwearId
  | EyewearId
  | EarringId
  | NecklaceId
  | FacialHairId;

export interface AvatarLook {
  gender: AvatarGender;
  skinTone: SkinToneId;
  hairColor: HairColorId;
  hairStyle: HairStyleId;
  eyeColor: EyeColorId;
  eyebrows: EyebrowId;
  top: TopId;
  jacket: JacketId;
  bottom: BottomId;
  shoes: ShoesId;
  headwear: HeadwearId;
  eyewear: EyewearId;
  earrings: EarringId;
  necklace: NecklaceId;
  facialHair: FacialHairId;
}
